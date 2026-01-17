import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, MapPin } from "lucide-react";
import { memo } from "react";

interface WeatherPillProps {
    temperature?: number;
    condition?: string;
    location?: string;
    onClick: () => void;
}

export const WeatherPill = memo(function WeatherPill({ temperature, condition, location, onClick }: WeatherPillProps) {
    const WeatherIcon = () => {
        const c = condition?.toLowerCase() || '';
        if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-4 h-4" />;
        if (c.includes('cloud')) return <Cloud className="w-4 h-4" />;
        return <Sun className="w-4 h-4" />;
    };

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] text-white text-xs font-medium hover:bg-[#333] transition-colors"
        >
            <WeatherIcon />
            <span>{temperature || '--'}°</span>
            <span className="text-white/60 hidden sm:inline">•</span>
            <span className="text-white/60 hidden sm:inline truncate max-w-[80px]">{location || 'Set Location'}</span>
        </button>
    );
});
