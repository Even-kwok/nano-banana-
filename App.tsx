import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GeneratedImage, PromptTemplateCategory } from './types';
import { toBase64, cropImage } from './utils/imageUtils';
import { generateImage } from './services/geminiService';
import { Button } from './components/Button';
import { IconUpload, IconSparkles, IconOptions, IconDownload, IconCamera, IconX, IconPlus, IconPhoto, IconBell, IconUserCircle, IconLogo } from './components/Icons';
import { TEMPLATE_CATEGORIES } from './constants';

// --- Re-styled Helper Components ---

const PromptTemplates: React.FC<{
    categories: PromptTemplateCategory[];
    activeCategory: string;
    onCategoryChange: (categoryName: string) => void;
    onTemplateSelect: (prompt: string) => void;
}> = ({ categories, activeCategory, onCategoryChange, onTemplateSelect }) => {
    const selectedCategory = categories.find(cat => cat.name === activeCategory);
    
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-start gap-4 border-b border-gray-800">
                {categories.map(category => (
                    <button
                        key={category.name}
                        onClick={() => onCategoryChange(category.name)}
                        className={`py-3 px-1 text-sm font-medium transition-colors relative ${activeCategory === category.name ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {category.name}
                        {activeCategory === category.name && (
                            <motion.div
                                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-400"
                                layoutId="underline"
                            />
                        )}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
                {selectedCategory?.templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onTemplateSelect(template.prompt)}
                        className="cursor-pointer group"
                    >
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-700 group-hover:border-emerald-400 transition-colors duration-300 bg-gray-800">
                            <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-2 font-medium group-hover:text-white transition-colors">{template.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PhotoDisplay: React.FC<{
    era: string;
    imageUrl: string;
    onDownload: (imageUrl: string, era: string) => void;
    onRegenerate: () => void;
    onImageClick: (imageUrl: string) => void;
}> = ({ era, imageUrl, onDownload, onRegenerate, onImageClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='relative group'
        >
            <div className="rounded-lg overflow-hidden cursor-pointer aspect-square" onClick={() => onImageClick(imageUrl)}>
                <img src={imageUrl} alt={`Generated image: ${era}`} className="w-full h-full object-cover" />
            </div>
            
            <div className="absolute top-3 right-3 z-10" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm shadow-lg"
                    aria-label="Options"
                >
                    <IconOptions />
                </button>

                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-12 mt-2 w-48 origin-top-right bg-black/80 backdrop-blur-md rounded-lg shadow-2xl ring-1 ring-white/10 text-white text-sm flex flex-col p-1"
                    >
                        <button onClick={() => { onRegenerate(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-emerald-400/20 rounded-md transition-colors">Regenerate</button>
                        <button onClick={() => { onDownload(imageUrl, era); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-emerald-400/20 rounded-md transition-colors">Download</button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const SkeletonLoader: React.FC<{className?: string}> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-800 rounded-lg ${className}`}></div>
);

const LoadingCard: React.FC = () => (
    <div className="relative bg-[#1A1A1A] rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-800"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
    </div>
);


const ErrorCard: React.FC<{ onRegenerate?: () => void; }> = ({ onRegenerate }) => (
    <div className="aspect-square flex flex-col items-center justify-center text-center p-4 rounded-lg bg-red-900/20 border-2 border-dashed border-red-500/50">
        <p className="text-red-400 font-medium mb-4">Generation failed</p>
        {onRegenerate && <Button onClick={onRegenerate} primary>Retry</Button>}
    </div>
);

const ErrorNotification: React.FC<{message: string | null; onDismiss: () => void}> = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
        <div className="fixed top-5 left-1/2 z-50 w-full max-w-md p-4 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg shadow-2xl flex items-center justify-between animate-fade-in-down" style={{transform: 'translateX(-50%)'}}>
            <span>{message}</span>
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-gray-800 transition-colors ml-4">
                <IconX/>
            </button>
        </div>
    );
};

const CameraModal: React.FC<{
    isOpen: boolean; 
    onClose: () => void; 
    onCapture: (imageDataUrl: string) => void;
}> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        if (videoRef.current) {
            setCameraError(null);
            try {
                stopCamera();
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1024 }, height: { ideal: 1024 }, facingMode: 'user' }
                });
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            } catch (err) {
                console.error("Error accessing camera:", err);
                setCameraError("Camera access denied. Please allow camera access in your browser settings.");
            }
        }
    }, [stopCamera]);

    useEffect(() => {
        if (isOpen && !capturedImage) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, capturedImage, startCamera, stopCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (!context) return;
            context.scale(-1, 1);
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            setCapturedImage(null);
            onClose();
        }
    };

    const handleRetake = () => setCapturedImage(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-700 shadow-2xl w-full max-w-2xl text-center relative"
             >
                <h3 className="text-2xl font-semibold mb-4 text-white">Camera</h3>
                <div className="aspect-square bg-black rounded-lg overflow-hidden relative mb-4 flex items-center justify-center">
                    {cameraError ? <div className="p-4 text-red-400">{cameraError}</div> : (
                        <>
                            {capturedImage ? 
                                <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" /> : 
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
                            }
                        </>
                    )}
                </div>

                <div className="flex justify-center gap-4">
                    {capturedImage ? (
                        <>
                            <Button onClick={handleRetake}>Retake</Button>
                            <Button onClick={handleConfirm} primary>Use Photo</Button>
                        </>
                    ) : (
                         <button onClick={handleCapture} disabled={!!cameraError} className="w-20 h-20 rounded-full bg-white border-4 border-gray-600 focus:outline-none focus:ring-4 focus:ring-emerald-400 transition-all hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"></button>
                    )}
                </div>
                
                <button onClick={() => { setCapturedImage(null); onClose(); }} className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/70 text-white hover:bg-gray-700 transition-colors"><IconX /></button>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </motion.div>
        </div>
    );
};

const ImageViewerModal: React.FC<{ imageUrl: string | null; onClose: () => void; }> = ({ imageUrl, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!imageUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative"
                onClick={(e) => e.stopPropagation()} 
            >
                <img src={imageUrl} alt="Full screen view" className="block max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button onClick={onClose} className="absolute -top-3 -right-3 p-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors border border-gray-700" aria-label="Close image viewer"><IconX /></button>
            </motion.div>
        </div>
    );
};

const ImageUploadModule: React.FC<{
  title: string;
  description: string;
  images: (string | null)[];
  uploadingSlots: Record<number, boolean>;
  onFileSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onAdd?: () => void;
  maxImages?: number;
}> = ({ title, description, images, uploadingSlots, onFileSelect, onRemove, onAdd, maxImages = 18 }) => {
    return (
        <div className="space-y-3">
             <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {images.map((imageUrl, index) => {
                    const isUploading = uploadingSlots[index];
                    return (
                        <div
                            key={index}
                            className="aspect-square bg-[#2A2A2A] rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 relative group cursor-pointer hover:border-emerald-400/70 transition-colors"
                            onClick={() => !imageUrl && !isUploading && onFileSelect(index)}
                        >
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
                            ) : imageUrl ? (
                                <>
                                    <img src={imageUrl} alt={`Reference ${index}`} className="w-full h-full object-cover rounded-md" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                                        className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        aria-label={`Remove image ${index}`}
                                    >
                                        <IconX />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500 p-2 text-center">
                                    <IconUpload />
                                    <span className="text-xs mt-1">Upload</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {onAdd && images.length < maxImages && (
                    <button
                        onClick={onAdd}
                        className="aspect-square bg-transparent border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-emerald-400 hover:text-emerald-400 transition-colors"
                        aria-label="Add new image slot"
                    >
                        <IconPlus />
                        <span className="mt-1 text-xs font-medium">Add</span>
                    </button>
                )}
            </div>
        </div>
    );
};

// --- New Layout Components ---

const Header: React.FC = () => {
    const navItems = ["Explore", "Generate", "Redesign Interior", "My Renders"];
    const activeItem = "Generate";
    
    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1A1A1A]/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <IconLogo />
                    <span className="text-xl font-bold text-white">PhotoStudio</span>
                </div>
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map(item => (
                        <a key={item} href="#" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${activeItem === item ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                           {item}
                           {activeItem === item && <motion.div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400" layoutId="nav-underline" />}
                        </a>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"><IconBell/></button>
                <button><IconUserCircle/></button>
            </div>
        </header>
    );
}

const ResultsPlaceholder: React.FC = () => (
    <div className="w-full max-w-md text-center flex flex-col items-center justify-center">
        <div className="p-8 bg-[#1A1A1A] rounded-full border-2 border-gray-800 mb-6">
            <IconPhoto />
        </div>
        <h2 className="text-2xl font-semibold text-white">Your generated photos will appear here</h2>
        <p className="text-gray-500 mt-2">Get started by describing a style and uploading a photo in the left panel.</p>
    </div>
);


const getModelInstruction = (promptBase: string): string => promptBase.trim();


// --- Main App Component ---

const App: React.FC = () => {
    // Core state
    const [module1Images, setModule1Images] = useState<(string | null)[]>([null]);
    const [module2Images, setModule2Images] = useState<(string | null)[]>([null]);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
    const uploadTargetRef = useRef<{ module: 'm1' | 'm2', index: number } | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [activeTemplateCategory, setActiveTemplateCategory] = useState<string>(TEMPLATE_CATEGORIES[0].name);

    const hasModule1Image = useMemo(() => module1Images.some(img => img !== null), [module1Images]);
    const hasPrompt = useMemo(() => userPrompt.trim() !== '', [userPrompt]);

    // --- Image Handling ---
    
    const handleFileSelect = (module: 'm1' | 'm2', index: number) => {
        uploadTargetRef.current = { module, index };
        const input = fileInputRef.current;
        if (input) {
            input.multiple = module === 'm2';
            input.click();
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const capturedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (capturedFiles.length === 0 || !uploadTargetRef.current) return;
        
        const { module, index } = uploadTargetRef.current;
        const uploadKey = `${module}-${index}`;
        
        setUploadingSlots(prev => ({ ...prev, [uploadKey]: true }));
        setError(null);
        
        try {
            if (module === 'm1') {
                const base64Image = await toBase64(capturedFiles[0]);
                const croppedImage = await cropImage(base64Image, '1:1');
                setModule1Images([croppedImage]);
            } else { // module 'm2'
                 const processingPromises = capturedFiles.map(file => toBase64(file).then(b64 => cropImage(b64, '1:1')));
                 const newCroppedImages = await Promise.all(processingPromises);
                 setModule2Images(prev => {
                     let updatedImages = [...prev];
                     let currentIdx = index;
                     newCroppedImages.forEach(img => {
                        // Find the next available slot starting from the clicked index
                        let insertPos = updatedImages.findIndex((slot, i) => i >= currentIdx && slot === null);
                        if (insertPos === -1) insertPos = updatedImages.length; // Append if no slots

                        if (insertPos < 9) {
                           if(insertPos < updatedImages.length) updatedImages[insertPos] = img;
                           else updatedImages.push(img)
                           currentIdx = insertPos + 1;
                        }
                     });
                     return updatedImages.slice(0, 9);
                 });
            }
            setGeneratedImages([]);
        } catch (err) {
            console.error(`Error during ${module} upload:`, err);
            setError("An image couldn't be processed. Please try another file.");
        } finally {
            setUploadingSlots(prev => ({ ...prev, [uploadKey]: false }));
            uploadTargetRef.current = null;
        }
    };
    
    const handleRemoveImage = (module: 'm1' | 'm2', index: number) => {
        if (module === 'm1') {
            setModule1Images([null]);
        } else {
            setModule2Images(prev => {
                const newImages = prev.filter((_, i) => i !== index);
                return newImages.length === 0 ? [null] : newImages;
            });
        }
        setGeneratedImages([]);
    };

    const handleAddSlot = () => {
        setModule2Images(prev => prev.length < 9 ? [...prev, null] : prev);
    };

    const handleTemplateSelect = (prompt: string) => setUserPrompt(prompt);

    // --- Generation & Regeneration ---

    const handleGenerateClick = async () => {
        const cleanModule1 = module1Images.filter((img): img is string => !!img);
        if (cleanModule1.length === 0) {
            setError("Please upload a photo to Module 1.");
            return;
        }
        if (!hasPrompt) {
            setError("Please enter a style prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const cleanModule2 = module2Images.filter((img): img is string => !!img);
        const module1ForApi = cleanModule1.map(img => img.split(',')[1]);

        if (cleanModule2.length > 0) {
            // Combination Mode
            const placeholders: GeneratedImage[] = cleanModule2.map((_, index) => ({
                id: `Style 1 - Ref ${index + 1}`, status: 'pending', imageUrl: null, promptBase: userPrompt,
            }));
            setGeneratedImages(placeholders);
            
            const generationPromises = placeholders.map(async (placeholder, index) => {
                try {
                    const module2ImgForApi = cleanModule2[index].split(',')[1];
                    const imageUrl = await generateImage(getModelInstruction(userPrompt), [...module1ForApi, module2ImgForApi]);
                    setGeneratedImages(prev => prev.map(img => img.id === placeholder.id ? { ...img, status: 'success', imageUrl } : img));
                } catch (err) {
                    console.error(`Combination generation failed for ${placeholder.id}:`, err);
                    setGeneratedImages(prev => prev.map(img => img.id === placeholder.id ? { ...img, status: 'failed' } : img));
                }
            });
            await Promise.all(generationPromises);
        } else {
            // Standard Mode
            const placeholder: GeneratedImage = { id: 'Style 1', status: 'pending', imageUrl: null, promptBase: userPrompt };
            setGeneratedImages([placeholder]);
            try {
                const imageUrl = await generateImage(getModelInstruction(userPrompt), module1ForApi);
                setGeneratedImages([{ ...placeholder, status: 'success', imageUrl }]);
            } catch (err) {
                console.error(`Standard generation failed:`, err);
                setGeneratedImages([{ ...placeholder, status: 'failed' }]);
            }
        }
        setIsLoading(false);
    };

    const regenerateImageAtIndex = async (imageIndex: number) => {
        const imageToRegenerate = generatedImages[imageIndex];
        const cleanModule1 = module1Images.filter((img): img is string => !!img);
        if (!imageToRegenerate || cleanModule1.length === 0) return;
    
        setGeneratedImages(prev => prev.map((img, index) => index === imageIndex ? { ...img, status: 'pending' } : img));
        setError(null);
    
        const { id, promptBase } = imageToRegenerate;
        const module1ForApi = cleanModule1.map(img => img.split(',')[1]);
        const cleanModule2 = module2Images.filter((img): img is string => !!img);
        let imagesForApi: string[] = module1ForApi;
        
        const comboMatch = id.match(/Style 1 - Ref (\d+)/);
        if (comboMatch && cleanModule2.length > 0) {
            const refIndex = parseInt(comboMatch[1], 10) - 1;
            if (refIndex < cleanModule2.length) {
                imagesForApi = [...module1ForApi, cleanModule2[refIndex].split(',')[1]];
            }
        }
    
        try {
            const imageUrl = await generateImage(getModelInstruction(promptBase), imagesForApi);
            setGeneratedImages(prev => prev.map((img, i) => i === imageIndex ? { ...img, status: 'success', imageUrl } : img));
        } catch (err) {
            setError(`Oops! Regeneration for "${id}" failed.`);
            setGeneratedImages(prev => prev.map((img, i) => i === imageIndex ? { ...img, status: 'failed' } : img));
        }
    };

    // --- Downloading ---
    const handleDownloadRequest = async (imageUrl: string, era: string) => {
        const fileName = `photostudio-${era.toLowerCase().replace(/\s+/g, '-')}.png`;
        const link = document.createElement('a');
        link.href = await cropImage(imageUrl, '1:1');
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const isAnySlotUploading = Object.values(uploadingSlots).some(Boolean);
    const hasGeneratedImages = generatedImages.length > 0;
    const generationButtonText = module2Images.some(Boolean) ? `Generate ${module2Images.filter(Boolean).length} Photos` : `Generate Photo`;
    const progress = hasGeneratedImages ? (generatedImages.filter(img => img.status !== 'pending').length / generatedImages.length) * 100 : 0;

    return (
        <>
            <CameraModal isOpen={false} onClose={() => {}} onCapture={() => {}} />
            <ImageViewerModal imageUrl={fullScreenImage} onClose={() => setFullScreenImage(null)} />
            <ErrorNotification message={error} onDismiss={() => setError(null)} />

            <div className="flex flex-col h-screen bg-[#0F0F0F] text-gray-200">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Control Panel */}
                    <aside className="w-[380px] bg-[#1A1A1A] p-6 flex flex-col gap-8 overflow-y-auto scrollbar-hide flex-shrink-0">
                        <div className="space-y-6">
                             <ImageUploadModule
                                title="Module 1"
                                description="Primary subject photo."
                                images={module1Images}
                                uploadingSlots={Object.fromEntries(Object.entries(uploadingSlots).filter(([k]) => k.startsWith('m1-')).map(([k, v]) => [k.split('-')[1], v]))}
                                onFileSelect={(index) => handleFileSelect('m1', index)}
                                onRemove={(index) => handleRemoveImage('m1', index)}
                                maxImages={1}
                            />
                            <ImageUploadModule
                                title="Module 2 (Optional)"
                                description="Reference photos for style."
                                images={module2Images}
                                uploadingSlots={Object.fromEntries(Object.entries(uploadingSlots).filter(([k]) => k.startsWith('m2-')).map(([k, v]) => [k.split('-')[1], v]))}
                                onFileSelect={(index) => handleFileSelect('m2', index)}
                                onRemove={(index) => handleRemoveImage('m2', index)}
                                onAdd={handleAddSlot}
                                maxImages={9}
                            />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
                        
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">Describe Your Space</h2>
                            <textarea
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                placeholder="e.g., Cozy fireplace and minimalist atmosphere..."
                                className="w-full h-36 p-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors resize-none"
                                aria-label="Style prompt input"
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">Choose Style</h2>
                            <PromptTemplates
                                categories={TEMPLATE_CATEGORIES}
                                activeCategory={activeTemplateCategory}
                                onCategoryChange={setActiveTemplateCategory}
                                onTemplateSelect={handleTemplateSelect}
                            />
                        </div>

                        <div className="mt-auto pt-6">
                            <Button
                                onClick={handleGenerateClick}
                                disabled={!hasModule1Image || !hasPrompt || isLoading || isAnySlotUploading}
                                primary
                                className="w-full text-base py-3"
                            >
                                <IconSparkles className="w-5 h-5" />
                                {isLoading ? `Generating... (${Math.round(progress)}%)` : generationButtonText}
                            </Button>
                        </div>
                    </aside>

                    {/* Right Results Display */}
                    <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
                        <div className="w-full h-full">
                            {!hasGeneratedImages && !isLoading && <ResultsPlaceholder />}
                            
                            {(hasGeneratedImages || isLoading) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {(isLoading && generatedImages.length === 0 ? Array.from({length: module2Images.filter(i=>i).length || 1}, () => null) : generatedImages).map((img, index) => {
                                        if (!img) return <LoadingCard key={`loading-skeleton-${index}`} />;
                                        switch (img.status) {
                                            case 'success': return <PhotoDisplay key={`${img.id}-${index}-success`} era={img.id} imageUrl={img.imageUrl!} onDownload={handleDownloadRequest} onRegenerate={() => regenerateImageAtIndex(index)} onImageClick={setFullScreenImage} />;
                                            case 'failed': return <ErrorCard key={`${img.id}-${index}-failed`} onRegenerate={() => regenerateImageAtIndex(index)} />;
                                            case 'pending': default: return <LoadingCard key={`${img.id}-${index}-pending`} />;
                                        }
                                    })}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default App;