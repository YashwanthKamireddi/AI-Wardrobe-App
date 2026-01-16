/**
 * Style Preferences Manager Component
 * Allows users to set weather and mood clothing preferences
 */

import { useState } from "react";
import { Plus, Trash2, Cloud, Smile, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
    useWeatherPreferences,
    useMoodPreferences,
    useCreateWeatherPreference,
    useDeleteWeatherPreference,
    useCreateMoodPreference,
    useDeleteMoodPreference,
} from "@/hooks/use-preferences";

import { weatherTypes, moodTypes, clothingCategories } from "@shared/schema";

export function PreferencesManager() {
    const [expandedSection, setExpandedSection] = useState<"weather" | "mood" | null>("weather");
    const [selectedWeather, setSelectedWeather] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState("");
    const [selectedMoodCategories, setSelectedMoodCategories] = useState<string[]>([]);

    const { data: weatherPrefs = [], isLoading: loadingWeather } = useWeatherPreferences();
    const { data: moodPrefs = [], isLoading: loadingMood } = useMoodPreferences();

    const createWeatherPref = useCreateWeatherPreference();
    const deleteWeatherPref = useDeleteWeatherPreference();
    const createMoodPref = useCreateMoodPreference();
    const deleteMoodPref = useDeleteMoodPreference();

    const handleAddWeatherPref = () => {
        if (!selectedWeather || selectedCategories.length === 0) return;

        createWeatherPref.mutate({
            weatherType: selectedWeather,
            preferredCategories: selectedCategories,
        });
        setSelectedWeather("");
        setSelectedCategories([]);
    };

    const handleAddMoodPref = () => {
        if (!selectedMood || selectedMoodCategories.length === 0) return;

        createMoodPref.mutate({
            mood: selectedMood,
            preferredCategories: selectedMoodCategories,
        });
        setSelectedMood("");
        setSelectedMoodCategories([]);
    };

    const toggleCategory = (category: string, isMood: boolean) => {
        if (isMood) {
            setSelectedMoodCategories(prev =>
                prev.includes(category)
                    ? prev.filter(c => c !== category)
                    : [...prev, category]
            );
        } else {
            setSelectedCategories(prev =>
                prev.includes(category)
                    ? prev.filter(c => c !== category)
                    : [...prev, category]
            );
        }
    };

    // Filter out already-used weather types and moods
    const availableWeatherTypes = weatherTypes.filter(
        w => !weatherPrefs.some(p => p.weatherType === w.value)
    );
    const availableMoodTypes = moodTypes.filter(
        m => !moodPrefs.some(p => p.mood === m.value)
    );

    return (
        <div className="space-y-4">
            {/* Weather Preferences */}
            <Card>
                <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === "weather" ? null : "weather")}
                >
                    <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            Weather Preferences
                        </div>
                        {expandedSection === "weather" ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </CardTitle>
                </CardHeader>

                {expandedSection === "weather" && (
                    <CardContent className="space-y-4">
                        {/* Existing preferences */}
                        {loadingWeather ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : weatherPrefs.length > 0 ? (
                            <div className="space-y-2">
                                {weatherPrefs.map((pref) => (
                                    <div key={pref.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className="capitalize">{pref.weatherType}</Badge>
                                            <span className="text-sm text-muted-foreground">→</span>
                                            {pref.preferredCategories?.map((cat) => (
                                                <Badge key={cat} variant="outline" className="capitalize">{cat}</Badge>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteWeatherPref.mutate(pref.id)}
                                            disabled={deleteWeatherPref.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No weather preferences set</p>
                        )}

                        {/* Add new preference */}
                        {availableWeatherTypes.length > 0 && (
                            <div className="border-t pt-4 space-y-3">
                                <p className="text-sm font-medium">Add new preference</p>
                                <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select weather type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableWeatherTypes.map((w) => (
                                            <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedWeather && (
                                    <>
                                        <p className="text-xs text-muted-foreground">Select preferred categories:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {clothingCategories.map((cat) => (
                                                <label
                                                    key={cat.value}
                                                    className="flex items-center gap-1.5 text-sm cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedCategories.includes(cat.value)}
                                                        onCheckedChange={() => toggleCategory(cat.value, false)}
                                                    />
                                                    {cat.label}
                                                </label>
                                            ))}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={handleAddWeatherPref}
                                            disabled={selectedCategories.length === 0 || createWeatherPref.isPending}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Preference
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Mood Preferences */}
            <Card>
                <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === "mood" ? null : "mood")}
                >
                    <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                            <Smile className="h-4 w-4" />
                            Mood Preferences
                        </div>
                        {expandedSection === "mood" ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </CardTitle>
                </CardHeader>

                {expandedSection === "mood" && (
                    <CardContent className="space-y-4">
                        {/* Existing preferences */}
                        {loadingMood ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : moodPrefs.length > 0 ? (
                            <div className="space-y-2">
                                {moodPrefs.map((pref) => (
                                    <div key={pref.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className="capitalize">{pref.mood}</Badge>
                                            <span className="text-sm text-muted-foreground">→</span>
                                            {pref.preferredCategories?.map((cat) => (
                                                <Badge key={cat} variant="outline" className="capitalize">{cat}</Badge>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteMoodPref.mutate(pref.id)}
                                            disabled={deleteMoodPref.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No mood preferences set</p>
                        )}

                        {/* Add new preference */}
                        {availableMoodTypes.length > 0 && (
                            <div className="border-t pt-4 space-y-3">
                                <p className="text-sm font-medium">Add new preference</p>
                                <Select value={selectedMood} onValueChange={setSelectedMood}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select mood" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMoodTypes.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedMood && (
                                    <>
                                        <p className="text-xs text-muted-foreground">Select preferred categories:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {clothingCategories.map((cat) => (
                                                <label
                                                    key={cat.value}
                                                    className="flex items-center gap-1.5 text-sm cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedMoodCategories.includes(cat.value)}
                                                        onCheckedChange={() => toggleCategory(cat.value, true)}
                                                    />
                                                    {cat.label}
                                                </label>
                                            ))}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={handleAddMoodPref}
                                            disabled={selectedMoodCategories.length === 0 || createMoodPref.isPending}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Preference
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

export default PreferencesManager;
