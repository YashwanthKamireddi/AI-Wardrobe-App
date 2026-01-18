import { useRef, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";

interface Slot {
    id: string;
    label: string;
    item: any | null;
    zIndex: number;
}

interface AtelierCanvasProps {
    slots: Slot[];
    selectedSlotId: string | null;
    onSelectSlot: (id: string) => void;
    onClearSlot: (id: string) => void;
}

export function AtelierCanvas({ slots, selectedSlotId, onSelectSlot, onClearSlot }: AtelierCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative w-full h-full flex flex-col" ref={containerRef}>
            {/* Canvas Area - Infinite Feel (but constrained for V1) */}
            <div className="flex-1 relative overflow-hidden bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E5E5]">

                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Free-form ish Slots */}
                <div className="absolute inset-0 flex flex-col items-center justify-center py-8 px-4">
                    <div className="relative w-full max-w-sm aspect-[3/4]">
                        {slots.map((slot) => {
                            // Calculate position based on slot type for a "mannequin" layout
                            // Top, Bottom, Shoes, etc.
                            // For V1 we stack them visually or use a grid if it helps,
                            // but let's try a loose vertical stack with overlaps

                            return (
                                <motion.div
                                    key={slot.id}
                                    layoutId={`slot-${slot.id}`}
                                    className={`absolute w-40 h-40 md:w-48 md:h-48 transition-all duration-300
                                        ${selectedSlotId === slot.id ? 'z-50 scale-105' : `z-[${slot.zIndex}]`}
                                    `}
                                    style={{
                                        top: getSlotPosition(slot.id).top,
                                        left: getSlotPosition(slot.id).left,
                                        zIndex: selectedSlotId === slot.id ? 50 : slot.zIndex
                                    }}
                                    onClick={() => onSelectSlot(slot.id)}
                                >
                                    <motion.div
                                        className={`w-full h-full relative rounded-lg overflow-hidden bg-white shadow-sm border transition-colors
                                            ${selectedSlotId === slot.id ? 'border-[#1A1A1A] shadow-xl' : 'border-transparent hover:border-[#E5E5E5]'}
                                        `}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {slot.item ? (
                                            <div className="w-full h-full relative group">
                                                <img
                                                    src={slot.item.imageUrl}
                                                    alt={slot.label}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onClearSlot(slot.id); }}
                                                    className="absolute top-1 right-1 p-1 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3 text-black" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[#D5D5D5]">
                                                <div className={`
                                                    w-8 h-8 rounded-full border border-dashed border-[#D5D5D5] flex items-center justify-center mb-2
                                                    ${selectedSlotId === slot.id ? 'bg-[#FAFAFA] text-[#1A1A1A] border-[#1A1A1A]' : ''}
                                                `}>
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                                <span className={`text-[9px] uppercase tracking-widest ${selectedSlotId === slot.id ? 'text-[#1A1A1A]' : ''}`}>
                                                    {slot.label}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to position slots in a "look" layout
function getSlotPosition(id: string): CSSProperties {
    switch (id) {
        case 'top': return { top: '5%', left: 'calc(50% - 5rem)' }; // Center Top
        case 'bottom': return { top: '35%', left: 'calc(50% - 5rem)' }; // Center Bottom
        case 'shoes': return { top: '70%', left: 'calc(50% - 5rem)' }; // Center Shoes
        case 'outerwear': return { top: '15%', left: '10%' }; // Left Offset
        case 'accessory': return { top: '15%', right: '10%', left: 'auto' }; // Right Offset
        default: return { top: '0', left: '0' };
    }
}
