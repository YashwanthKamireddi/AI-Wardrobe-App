/**
 * STYLE QUIZ COMPONENT
 *
 * Multi-step style profiling quiz following Vessura design system.
 * Based on Indyx's approach to understanding personal style.
 *
 * Steps:
 * 1. Style Category Selection
 * 2. Color Preferences
 * 3. Lifestyle & Occasions
 * 4. Style Words
 * 5. Shopping Habits
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight, ChevronLeft, Sparkles, Check,
    Palette, Heart, Calendar, ShoppingBag, Tag
} from "lucide-react";
import { BRAND, STYLE_QUIZ, StyleCategory, StyleWord } from "@/lib/brand";

interface StyleProfile {
    categories: StyleCategory[];
    colorPreferences: string[];
    occasions: string[];
    styleWords: StyleWord[];
    shoppingHabits: string[];
}

interface StyleQuizProps {
    onComplete: (profile: StyleProfile) => void;
    onSkip?: () => void;
}

const STEPS = [
    { id: 1, title: "Your Style DNA", subtitle: "What styles resonate with you?", icon: Sparkles },
    { id: 2, title: "Color Palette", subtitle: "What colors make you feel confident?", icon: Palette },
    { id: 3, title: "Your Lifestyle", subtitle: "How do you spend your days?", icon: Calendar },
    { id: 4, title: "Style Words", subtitle: "Pick 3-5 words that describe your ideal style", icon: Tag },
    { id: 5, title: "Shopping Philosophy", subtitle: "How do you approach building your wardrobe?", icon: ShoppingBag },
];

export function StyleQuiz({ onComplete, onSkip }: StyleQuizProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [profile, setProfile] = useState<StyleProfile>({
        categories: [],
        colorPreferences: [],
        occasions: [],
        styleWords: [],
        shoppingHabits: [],
    });

    const toggleSelection = (field: keyof StyleProfile, value: string) => {
        setProfile(prev => {
            const current = prev[field] as string[];
            const exists = current.includes(value);

            // Limit style words to 5
            if (field === 'styleWords' && !exists && current.length >= 5) {
                return prev;
            }

            return {
                ...prev,
                [field]: exists
                    ? current.filter(v => v !== value)
                    : [...current, value],
            };
        });
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return profile.categories.length >= 1;
            case 2: return profile.colorPreferences.length >= 1;
            case 3: return profile.occasions.length >= 1;
            case 4: return profile.styleWords.length >= 3;
            case 5: return profile.shoppingHabits.length >= 1;
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete(profile);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const step = STEPS[currentStep - 1];
    const StepIcon = step.icon;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <SelectionGrid
                        items={STYLE_QUIZ.categories as unknown as string[]}
                        selected={profile.categories}
                        onToggle={(v) => toggleSelection('categories', v)}
                        columns={2}
                    />
                );
            case 2:
                return (
                    <SelectionGrid
                        items={STYLE_QUIZ.colorPreferences as unknown as string[]}
                        selected={profile.colorPreferences}
                        onToggle={(v) => toggleSelection('colorPreferences', v)}
                        columns={1}
                    />
                );
            case 3:
                return (
                    <SelectionGrid
                        items={STYLE_QUIZ.occasions as unknown as string[]}
                        selected={profile.occasions}
                        onToggle={(v) => toggleSelection('occasions', v)}
                        columns={2}
                    />
                );
            case 4:
                return (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            Selected: {profile.styleWords.length}/5
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(STYLE_QUIZ.styleWords as unknown as string[]).map(word => {
                                const isSelected = profile.styleWords.includes(word as StyleWord);
                                return (
                                    <button
                                        key={word}
                                        onClick={() => toggleSelection('styleWords', word)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                                ? 'bg-[#80163A] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {word}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <SelectionGrid
                        items={STYLE_QUIZ.shoppingHabits as unknown as string[]}
                        selected={profile.shoppingHabits}
                        onToggle={(v) => toggleSelection('shoppingHabits', v)}
                        columns={1}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
            {/* Header */}
            <header className="p-6 border-b border-black/5">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1
                            className="text-2xl text-[#1A1A1A]"
                            style={{ fontFamily: BRAND.fonts.heading }}
                        >
                            {BRAND.name} <span className="text-[#80163A]">Style Quiz</span>
                        </h1>
                        {onSkip && (
                            <button
                                onClick={onSkip}
                                className="text-sm text-gray-400 hover:text-gray-600"
                            >
                                Skip for now
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-2">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.id}
                                className={`h-1 flex-1 rounded-full transition-colors ${i + 1 <= currentStep ? 'bg-[#80163A]' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Step Header */}
                            <div className="mb-8">
                                <div className="w-12 h-12 rounded-full bg-[#80163A]/10 flex items-center justify-center mb-4">
                                    <StepIcon className="w-6 h-6 text-[#80163A]" />
                                </div>
                                <h2
                                    className="text-2xl md:text-3xl text-[#1A1A1A] mb-2"
                                    style={{ fontFamily: BRAND.fonts.heading }}
                                >
                                    {step.title}
                                </h2>
                                <p className="text-gray-500">{step.subtitle}</p>
                            </div>

                            {/* Step Content */}
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="p-6 border-t border-black/5 bg-white">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentStep === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:text-[#1A1A1A] hover:bg-gray-100'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    <span className="text-sm text-gray-400">
                        Step {currentStep} of {STEPS.length}
                    </span>

                    <motion.button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${canProceed()
                                ? 'bg-[#1A1A1A] text-white hover:bg-[#80163A]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        whileHover={canProceed() ? { scale: 1.02 } : {}}
                        whileTap={canProceed() ? { scale: 0.98 } : {}}
                    >
                        {currentStep === 5 ? (
                            <>
                                Complete
                                <Check className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </motion.button>
                </div>
            </footer>
        </div>
    );
}

// Selection Grid Component
function SelectionGrid({
    items,
    selected,
    onToggle,
    columns = 2
}: {
    items: string[];
    selected: string[];
    onToggle: (value: string) => void;
    columns?: number;
}) {
    return (
        <div className={`grid gap-3 ${columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {items.map(item => {
                const isSelected = selected.includes(item);
                return (
                    <motion.button
                        key={item}
                        onClick={() => onToggle(item)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                ? 'border-[#80163A] bg-[#80163A]/5'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${isSelected ? 'text-[#80163A]' : 'text-[#1A1A1A]'
                                }`}>
                                {item}
                            </span>
                            {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#80163A] flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

export default StyleQuiz;
