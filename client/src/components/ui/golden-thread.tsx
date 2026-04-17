/**
 * Golden Thread Animation Component
 * Decorative animated line effect for premium UI
 */

import { motion } from "framer-motion";

interface GoldenThreadProps {
    className?: string;
    direction?: "horizontal" | "vertical";
    length?: string;
    thickness?: number;
    animationDuration?: number;
}

export function GoldenThread({
    className = "",
    direction = "horizontal",
    length = "100%",
    thickness = 1,
    animationDuration = 2,
}: GoldenThreadProps) {
    const isHorizontal = direction === "horizontal";

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                height: isHorizontal ? `${thickness}px` : length,
                width: isHorizontal ? length : `${thickness}px`,
            }}
        >
            <motion.div
                className={`absolute bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent ${isHorizontal ? 'h-full w-1/2' : 'w-full h-1/2'
                    }`}
                initial={{ x: isHorizontal ? "-100%" : 0, y: isHorizontal ? 0 : "-100%" }}
                animate={{
                    x: isHorizontal ? "200%" : 0,
                    y: isHorizontal ? 0 : "200%"
                }}
                transition={{
                    duration: animationDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <div className={`absolute inset-0 bg-[#D4AF37]/20`} />
        </div>
    );
}

export default GoldenThread;
