
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a dynamic prompt for a theme using Gemini.
 * @param themeDescription A description of the theme.
 * @returns A promise that resolves to the generated prompt string.
 */
export const generateDynamicPrompt = async (themeDescription: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a creative and specific style for a photoshoot. The style should be described in a single, detailed sentence. Style theme: ${themeDescription}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating dynamic prompt:", error);
        throw new Error("Failed to generate a creative style. Please try again.");
    }
};

/**
 * Generates an image using the Gemini image editing model.
 * @param instruction The detailed instruction for the image generation.
 * @param base64Images An array of base64 encoded source image strings (without the data: prefix).
 * @returns A promise that resolves to the base64 URL of the generated image.
 */
export const generateImage = async (instruction: string, base64Images: string[]): Promise<string> => {
    try {
        const textPart = { text: instruction };
        const imageParts = base64Images.map(imgData => ({
            inlineData: {
                data: imgData,
                mimeType: 'image/png', // The app consistently uses PNG format
            },
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    textPart,
                    ...imageParts,
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // The model can return multiple parts, find the image part.
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        
        if (imagePart && imagePart.inlineData) {
            const base64Data = imagePart.inlineData.data;
            return `data:image/png;base64,${base64Data}`;
        }
        
        throw new Error("API response did not contain image data.");
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Image generation failed. Please check the console for details.");
    }
};
