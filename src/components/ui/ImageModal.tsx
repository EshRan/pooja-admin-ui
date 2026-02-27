import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ImageModalProps {
    isOpen: boolean;
    imageUrl: string;
    altText?: string;
    onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, altText = "Full size image", onClose }) => {
    // Handle escape key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">

                {/* Controls Bar */}
                <div className="w-full flex justify-end gap-3 p-4 absolute -top-16 right-0">
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur-md transition-colors shadow-lg"
                        title="Open original image"
                    >
                        <ExternalLink size={20} />
                    </a>
                    <button
                        onClick={onClose}
                        className="bg-slate-800/80 hover:bg-rose-600 text-white p-2 rounded-full backdrop-blur-md transition-colors shadow-lg"
                        title="Close preview"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center w-full min-h-[300px]">
                    <img
                        src={imageUrl}
                        alt={altText}
                        className="max-w-full max-h-[85vh] object-contain"
                    />
                </div>
            </div>
        </div>
    );
};
