import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

/**
 * Lock Item Button - Luxury Minimal Style
 * For outfit regeneration - lock items you want to keep
 */

interface LockItemButtonProps {
    isLocked: boolean;
    onToggle: () => void;
}

export function LockItemButton({ isLocked, onToggle }: LockItemButtonProps) {
    return (
        <motion.button
            onClick={onToggle}
            className="
        w-8 h-8 flex items-center justify-center
        bg-white/90 backdrop-blur-sm
        border border-gray-200
        hover:bg-black hover:text-white hover:border-black
        transition-all duration-300
      "
            whileTap={{ scale: 0.95 }}
        >
            {isLocked ? (
                <Lock className="w-4 h-4" />
            ) : (
                <Unlock className="w-4 h-4" />
            )}
        </motion.button>
    );
}
