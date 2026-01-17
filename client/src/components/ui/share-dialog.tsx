import { motion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Share Dialog - Elegant Modal
 * For sharing outfits with generated link
 */

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
    title: string;
}

export function ShareDialog({ isOpen, onClose, shareUrl, title }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Dialog */}
            <motion.div
                className="relative w-full max-w-md bg-white rounded-none p-8"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="space-y-6">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
                            Share Outfit
                        </p>
                        <h2 className="text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {title}
                        </h2>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs tracking-[0.1em] uppercase text-gray-500">
                            Share Link
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                            />
                            <button
                                onClick={handleCopy}
                                className="w-12 h-12 flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {copied && (
                            <p className="text-xs text-green-600">Copied to clipboard!</p>
                        )}
                    </div>

                    <div className="pt-4">
                        <p className="text-xs text-gray-600">
                            Anyone with this link can view your outfit
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
