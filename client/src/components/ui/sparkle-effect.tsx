/**
 * Sparkle Effect Component
 * Decorative sparkle animation for premium UI
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SparkleEffectProps {
    className?: string;
    count?: number;
    size?: number;
    children?: ReactNode;
}

export function SparkleEffect({
    className = "",
    count = 5,
    size = 4,
    children,
}: SparkleEffectProps) {
    const sparkles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        sparkleSize: (Math.random() * size) + (size / 2),
    }));

    return (
        <div className={`relative ${className}`}>
            {children}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {sparkles.map((sparkle) => (
                    <motion.div
                        key={sparkle.id}
                        className="absolute"
                        style={{
                            left: `${sparkle.x}%`,
                            top: `${sparkle.y}%`,
                            width: sparkle.sparkleSize,
                            height: sparkle.sparkleSize,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: sparkle.delay,
                            ease: "easeOut",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                            <path
                                d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                                fill="#D4AF37"
                            />
                        </svg>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default SparkleEffect;
