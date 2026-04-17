/**
 * Luxury Feature Guide Component
 * Onboarding/feature highlight component with premium styling
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";

interface FeatureStep {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

interface LuxuryFeatureGuideProps {
    isOpen: boolean;
    onClose: () => void;
    features?: FeatureStep[];
    title?: string;
}

const defaultFeatures: FeatureStep[] = [
    {
        title: "AI Styling",
        description: "Get personalized outfit recommendations based on your mood and weather",
        icon: <Sparkles className="w-6 h-6" />,
    },
];

export function LuxuryFeatureGuide({
    isOpen,
    onClose,
    features = defaultFeatures,
    title = "Welcome to Your Wardrobe"
}: LuxuryFeatureGuideProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-[#1A1A1A] to-[#333] text-white">
                        <h2
                            className="text-2xl mb-2"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {title}
                        </h2>
                        <p className="text-white/60 text-sm">Discover what you can do</p>
                    </div>

                    {/* Features */}
                    <div className="p-6 space-y-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#FAF9F6] flex items-center justify-center flex-shrink-0">
                                    {feature.icon || <Sparkles className="w-5 h-5 text-[#80163A]" />}
                                </div>
                                <div>
                                    <h3 className="font-medium text-[#1A1A1A]">{feature.title}</h3>
                                    <p className="text-sm text-gray-500">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-[#1A1A1A] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#80163A] transition-colors"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default LuxuryFeatureGuide;
