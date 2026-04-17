/**
 * SEASONAL FILTER COMPONENT
 *
 * Premium seasonal filter cards following Celura Design System.
 * Visual filter buttons for season and weather-based wardrobe filtering.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Cloud, CloudRain, Snowflake, Wind, Thermometer } from "lucide-react";
import {
    Season,
    WeatherCondition,
    useSeasonalWardrobe,
    getCurrentSeason,
    getSeasonStyles
} from "@/hooks/use-seasonal-filter";

interface SeasonalFilterProps {
    onFilterChange?: (season: Season | null, weather: WeatherCondition | null) => void;
}

export function SeasonalFilter({ onFilterChange }: SeasonalFilterProps) {
    const [activeSeason, setActiveSeason] = useState<Season | null>(null);
    const [activeWeather, setActiveWeather] = useState<WeatherCondition | null>(null);

    const currentSeason = getCurrentSeason();

    const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
    const weatherConditions: { value: WeatherCondition; icon: React.ReactNode; label: string }[] = [
        { value: 'hot', icon: <Sun className="w-4 h-4" />, label: 'Hot' },
        { value: 'cold', icon: <Snowflake className="w-4 h-4" />, label: 'Cold' },
        { value: 'rainy', icon: <CloudRain className="w-4 h-4" />, label: 'Rainy' },
        { value: 'mild', icon: <Cloud className="w-4 h-4" />, label: 'Mild' },
    ];

    const handleSeasonClick = (season: Season) => {
        const newSeason = activeSeason === season ? null : season;
        setActiveSeason(newSeason);
        onFilterChange?.(newSeason, activeWeather);
    };

    const handleWeatherClick = (weather: WeatherCondition) => {
        const newWeather = activeWeather === weather ? null : weather;
        setActiveWeather(newWeather);
        onFilterChange?.(activeSeason, newWeather);
    };

    return (
        <div className="space-y-4">
            {/* Season Filter */}
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Season</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {seasons.map(season => {
                        const styles = getSeasonStyles(season);
                        const isActive = activeSeason === season;
                        const isCurrent = currentSeason === season;

                        return (
                            <motion.button
                                key={season}
                                onClick={() => handleSeasonClick(season)}
                                className={`relative px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${isActive
                                        ? 'bg-gradient-to-r ' + styles.colors + ' text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>{styles.icon}</span>
                                <span className="text-sm font-medium">{styles.label}</span>
                                {isCurrent && !isActive && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#80163A] rounded-full" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Weather Filter */}
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Weather</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {weatherConditions.map(({ value, icon, label }) => {
                        const isActive = activeWeather === value;

                        return (
                            <motion.button
                                key={value}
                                onClick={() => handleWeatherClick(value)}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${isActive
                                        ? 'bg-[#1A1A1A] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {icon}
                                <span className="text-sm font-medium">{label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Active Filters Summary */}
            {(activeSeason || activeWeather) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-lg"
                >
                    <p className="text-sm text-gray-600">
                        Showing items for{' '}
                        {activeSeason && <span className="font-medium">{getSeasonStyles(activeSeason).label}</span>}
                        {activeSeason && activeWeather && ' + '}
                        {activeWeather && <span className="font-medium">{activeWeather} weather</span>}
                    </p>
                    <button
                        onClick={() => {
                            setActiveSeason(null);
                            setActiveWeather(null);
                            onFilterChange?.(null, null);
                        }}
                        className="text-xs text-[#80163A] hover:underline"
                    >
                        Clear filters
                    </button>
                </motion.div>
            )}
        </div>
    );
}

/**
 * Compact Season Pills for inline use
 */
export function SeasonPills({
    value,
    onChange
}: {
    value: Season | null;
    onChange: (season: Season | null) => void;
}) {
    const seasons: Season[] = ['spring', 'summer', 'fall', 'winter', 'all'];

    return (
        <div className="flex gap-1.5 flex-wrap">
            {seasons.map(season => {
                const styles = getSeasonStyles(season);
                const isActive = value === season;

                return (
                    <button
                        key={season}
                        onClick={() => onChange(isActive ? null : season)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isActive
                                ? 'bg-[#1A1A1A] text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {styles.icon} {styles.label}
                    </button>
                );
            })}
        </div>
    );
}

export default SeasonalFilter;
