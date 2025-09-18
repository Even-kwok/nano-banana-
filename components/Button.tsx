import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  primary?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, primary = false, className = '' }) => {
    const baseClass = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
    const themeClass = primary 
        ? "bg-gray-200 text-black hover:bg-white" 
        : "bg-[#2A2A2A] border border-gray-700 text-gray-300 hover:bg-gray-600/50 hover:text-white";
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${themeClass} ${className}`}
        >
            {children}
        </button>
    );
};
