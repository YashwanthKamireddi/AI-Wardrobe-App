import { motion, AnimatePresence } from 'framer-motion';

/**
 * Elegant AI Processing Overlay
 * Luxury aesthetic: Vertical line progress, minimal text, no gimmicks
 *
 * Usage:
 * <AIProcessingOverlay
 *   isProcessing={isAIProcessing}
 *   stage={aiStage}
 *   progress={aiProgress}
 * />
 */

interface AIProcessingOverlayProps {
    isProcessing: boolean;
    stage: string;
    progress: number;
}

export function AIProcessingOverlay({
    isProcessing,
    stage,
    progress
}: AIProcessingOverlayProps) {
    return (
        <AnimatePresence>
            {isProcessing && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            {/* Vertical progress line - elegant */}
                            <div className="w-px h-32 bg-white/10 mb-8 mx-auto relative overflow-hidden">
                                <motion.div
                                    className="absolute bottom-0 left-0 w-full bg-white"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${progress}%` }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.16, 1, 0.3, 1] // Elegant ease-out-expo
                                    }}
                                />
                            </div>

                            {/* Stage text - uppercase, spaced */}
                            <motion.p
                                className="text-white text-xs tracking-[0.25em] uppercase mb-2"
                                key={stage}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {stage}
                            </motion.p>

                            {/* Progress percentage - subtle */}
                            <p className="text-white/40 text-xs tabular-nums">
                                {progress}%
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
