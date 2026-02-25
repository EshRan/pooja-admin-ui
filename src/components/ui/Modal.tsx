import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-2xl'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200`}>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 bg-transparent hover:bg-slate-100 hover:text-slate-900 rounded-xl text-sm p-2 ml-auto inline-flex items-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-slate-600">
                    {children}
                </div>
            </div>
        </div>
    );
};
