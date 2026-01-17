import { motion } from 'framer-motion';

/**
 * Before/After Comparison - Editorial Style
 * Full-screen split view with hover labels
 */

interface BeforeAfterComparisonProps {
    isOpen: boolean;
    before: string;
    after: string;
    onClose: () => void;
}

export function BeforeAfterComparison({
    isOpen,
    before,
    after,
    onClose
}: BeforeAfterComparisonProps) {
    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-white z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-10 w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors duration-300"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Title */}
            <div className="absolute top-8 left-8 z-10">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Before & After
                </p>
            </div>

            {/* Split grid */}
            <div className="h-full grid grid-cols-2 gap-px bg-gray-200">
                {/* Before (Original) */}
                <div className="relative overflow-hidden group bg-gray-50">
                    <img
                        src={before}
                        className="w-full h-full object-contain p-12"
                        alt="Original photo"
                    />

                    {/* Hover reveal label */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-12 left-12">
                            <p className="text-white text-xs tracking-[0.25em] uppercase mb-1">
                                Original
                            </p>
                            <p className="text-white/60 text-xs">
                                As captured
                            </p>
                        </div>
                    </div>
                </div>

                {/* After (Refined) */}
                <div className="relative overflow-hidden group bg-white">
                    <img
                        src={after}
                        className="w-full h-full object-contain p-12"
                        alt="Refined photo"
                    />

                    {/* Hover reveal label */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-12 left-12">
                            <p className="text-white text-xs tracking-[0.25em] uppercase mb-1">
                                Refined
                            </p>
                            <p className="text-white/60 text-xs">
                                Background removed
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom action */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <button
                    onClick={onClose}
                    className="px-8 py-3 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                    <span className="text-xs tracking-[0.25em] uppercase">
                        Continue
                    </span>
                </button>
            </div>
        </motion.div>
    );
}
