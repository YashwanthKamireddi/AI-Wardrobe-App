/**
 * Runway Curtain Component
 * Page transition effect with premium curtain animation
 */

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RunwayCurtainProps {
    isOpen: boolean;
    onComplete?: () => void;
    color?: string;
    children?: ReactNode;
    direction?: string;
    openDuration?: number;
    closeDuration?: number;
}

export function RunwayCurtain({
    isOpen,
    onComplete,
    color = "#1A1A1A",
    children,
    direction = "horizontal",
    openDuration = 0.5,
    closeDuration = 0.5,
}: RunwayCurtainProps) {
    const duration = isOpen ? openDuration : closeDuration;

    return (
        <div className="relative">
            {children}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Left Curtain */}
                        <motion.div
                            className="fixed inset-y-0 left-0 w-1/2 z-[100]"
                            style={{ backgroundColor: color }}
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
                            onAnimationComplete={() => {
                                if (!isOpen && onComplete) onComplete();
                            }}
                        />
                        {/* Right Curtain */}
                        <motion.div
                            className="fixed inset-y-0 right-0 w-1/2 z-[100]"
                            style={{ backgroundColor: color }}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
                        />

                        {/* Center Logo/Text */}
                        <motion.div
                            className="fixed inset-0 z-[101] flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            <motion.span
                                className="text-white text-3xl tracking-widest"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                exit={{ y: -20 }}
                            >
                                VESSURA
                            </motion.span>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default RunwayCurtain;
