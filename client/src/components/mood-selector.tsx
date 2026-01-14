import { cn } from "@/lib/utils";
import { Smile, Zap, Coffee, Flame, Heart, Briefcase, Palette } from "lucide-react";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";

// Mood options with icons and subtle colors
const moodOptions = [
  { value: "happy", label: "Happy", icon: Smile, bgColor: "#fef3c7", iconColor: "#d97706" },
  { value: "confident", label: "Confident", icon: Zap, bgColor: "#ffedd5", iconColor: "#ea580c" },
  { value: "relaxed", label: "Relaxed", icon: Coffee, bgColor: "#dcfce7", iconColor: "#16a34a" },
  { value: "energetic", label: "Energetic", icon: Flame, bgColor: "#fee2e2", iconColor: "#dc2626" },
  { value: "romantic", label: "Romantic", icon: Heart, bgColor: "#fce7f3", iconColor: "#db2777" },
  { value: "professional", label: "Professional", icon: Briefcase, bgColor: "#dbeafe", iconColor: "#2563eb" },
  { value: "creative", label: "Creative", icon: Palette, bgColor: "#ede9fe", iconColor: "#7c3aed" },
];

interface MoodSelectorProps {
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
}

export default function MoodSelector({ selectedMood, setSelectedMood }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {moodOptions.map((mood) => {
        const isSelected = selectedMood === mood.value;
        const Icon = mood.icon;
        return (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={cn(
              "flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-200 border-2",
              isSelected
                ? "bg-white shadow-lg scale-[1.02]"
                : "bg-slate-50/50 border-transparent hover:bg-white hover:shadow-md"
            )}
            style={{
              borderColor: isSelected ? mood.iconColor : 'transparent',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform"
              style={{ backgroundColor: mood.bgColor }}
            >
              <Icon className="w-5 h-5" style={{ color: mood.iconColor }} />
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                isSelected ? "text-slate-900" : "text-slate-500"
              )}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
