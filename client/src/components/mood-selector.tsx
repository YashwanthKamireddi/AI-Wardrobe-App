import { cn } from "@/lib/utils";
import { moodTypes } from "@shared/schema";

interface MoodSelectorProps {
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
}

export default function MoodSelector({ selectedMood, setSelectedMood }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {moodTypes.map((mood) => (
        <button
          key={mood.value}
          onClick={() => setSelectedMood(mood.value)}
          className={cn(
            "px-4 py-2 text-sm rounded-full border transition-colors",
            selectedMood === mood.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground"
          )}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
}
