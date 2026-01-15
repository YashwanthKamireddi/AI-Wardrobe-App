import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Smile, Zap, Coffee, Flame, Heart, Briefcase, Palette } from "lucide-react";

/**
 * MOOD SELECTOR - ETHEREAL STRUCTURE
 *
 * Design: Minimal, monochromatic with subtle accent on selection
 * Matches the "Vogue meets Apple" aesthetic
 */

const moodOptions = [
  { value: "happy", label: "Happy", icon: Smile },
  { value: "confident", label: "Confident", icon: Zap },
  { value: "relaxed", label: "Relaxed", icon: Coffee },
  { value: "energetic", label: "Energetic", icon: Flame },
  { value: "romantic", label: "Romantic", icon: Heart },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "creative", label: "Creative", icon: Palette },
];

interface MoodSelectorProps {
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
}

export default function MoodSelector({ selectedMood, setSelectedMood }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
      {moodOptions.map((mood) => {
        const isSelected = selectedMood === mood.value;
        const Icon = mood.icon;
        return (
          <motion.button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300",
              isSelected
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isSelected ? "bg-white/10" : "bg-white"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isSelected ? "text-white" : "text-[#9A9A9A]"
                )}
              />
            </div>
            <span className="text-xs font-medium tracking-wide">
              {mood.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
