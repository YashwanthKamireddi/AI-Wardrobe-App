import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import {
    Sparkles,
    Palette,
    Scan,
    Globe,
    Fingerprint,
    Lock,
    Search,
    CheckCircle2,
    Share2,
    CreditCard,
    QrCode,
    RefreshCw
} from "lucide-react";
import { useStyleProfile } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

// --- Components ---

const PassportStamp = ({ label, date, rotation = 0, color = "text-[#80163A]" }: { label: string, date: string, rotation?: number, color?: string }) => (
    <motion.div
        className={`absolute border-2 border-dashed ${color} rounded-full w-24 h-24 flex flex-col items-center justify-center p-2 opacity-70 mix-blend-multiply pointer-events-none z-10`}
        style={{ rotate: rotation }}
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
        <span className={`text-[8px] uppercase font-bold ${color} tracking-widest text-center leading-tight`}>{label}</span>
        <span className={`text-[10px] ${color} font-mono mt-1`}>{date}</span>
    </motion.div>
);

const BiometricGrid = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`grid grid-cols-2 gap-px bg-[#E5E5E5] border border-[#E5E5E5] ${className}`}>
        {children}
    </div>
);

const BiometricItem = ({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) => (
    <div className="bg-white p-4 flex flex-col items-start justify-center hover:bg-[#FAF9F6] transition-colors">
        <div className="flex items-center gap-2 mb-2 w-full">
            {Icon && <Icon className="w-3 h-3 text-[#80163A]" />}
            <span className="text-[9px] uppercase tracking-widest text-[#9A9A9A]">{label}</span>
        </div>
        <span className="text-sm font-medium text-[#1A1A1A] font-mono">{value}</span>
    </div>
);

const ScanningLine = () => (
    <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#80163A] z-20 shadow-[0_0_20px_rgba(128,22,58,0.5)]"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
);

export function StyleProfilePage() {
    const { data: profile, isLoading } = useStyleProfile();
    const [scanned, setScanned] = useState(false);
    const [, setLocation] = useLocation();

    // Mock "scanning" effect when profile loads
    useEffect(() => {
        if (profile) {
            const timer = setTimeout(() => setScanned(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [profile]);

    // Format current date for "stamps"
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FAF9F6] pt-24 pb-12 px-4 md:px-8 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <motion.div
                        className="mb-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border border-[#1A1A1A]/20 rounded-full bg-white/50 backdrop-blur-sm">
                            <Fingerprint className="w-3 h-3 text-[#1A1A1A]" />
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]">Digital Identity</span>
                        </div>
                        <h1
                            className="text-5xl md:text-7xl text-[#1A1A1A] mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Style <span className="italic text-[#80163A]">Passport</span>
                        </h1>
                        <p className="text-[#6B6B6B] max-w-lg mx-auto font-light text-sm md:text-base leading-relaxed">
                            Your biometric fashion profile. A curated analysis of your unique aesthetic DNA, decoding your personal style signature.
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {!profile ? (
                            // --- UNVERIFIED STATE (No Profile) ---
                            <motion.div
                                key="unverified"
                                className="max-w-md mx-auto relative"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="absolute -inset-4 bg-gradient-to-b from-[#80163A]/5 to-transparent rounded-[2rem] -z-10 blur-xl" />

                                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-2xl relative">
                                    <ScanningLine />

                                    <div className="p-12 flex flex-col items-center text-center relative z-10">
                                        <div className="w-24 h-24 rounded-full bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center mb-8 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-[#80163A]/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                                            <Lock className="w-8 h-8 text-[#1A1A1A]/40" />
                                        </div>

                                        <h2 className="text-2xl font-playfair text-[#1A1A1A] mb-3">Identity Unverified</h2>
                                        <p className="text-xs text-[#9A9A9A] uppercase tracking-widest mb-8">Biometric Analysis Required</p>

                                        <p className="text-[#6B6B6B] mb-8 font-light leading-relaxed">
                                            Initiate the diagnostic sequence to decode your unique style DNA. Takes approximately 2 minutes.
                                        </p>

                                        <Button
                                            onClick={() => {
                                                // Check if it's an item count issue
                                                // In a real app we'd check error state from the query
                                                // For now, assume if we are here, we might need to add items or just retry
                                                window.location.href = "/wardrobe";
                                            }}
                                            className="w-full bg-[#1A1A1A] text-white hover:bg-[#80163A] h-14 text-xs uppercase tracking-widest rounded-none"
                                        >
                                            <Scan className="w-4 h-4 mr-2" />
                                            Add Items to Analyze
                                        </Button>
                                        <p className="mt-4 text-[10px] text-[#9A9A9A] tracking-wider">Requires minimum 5 wardrobe items</p>
                                    </div>

                                    {/* Tech details footer */}
                                    <div className="bg-[#FAF9F6] p-4 border-t border-[#E5E5E5] flex justify-between items-center text-[9px] text-[#9A9A9A] font-mono uppercase tracking-wider">
                                        <span>SYS.VER.4.0</span>
                                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Offline</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            // --- VERIFIED STATE (Profile Exists) ---
                            <motion.div
                                key="verified"
                                className="bg-white border border-[#E5E5E5] shadow-2xl max-w-5xl mx-auto flex flex-col md:flex-row overflow-hidden min-h-[600px] relative"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {/* Loading "Scan" Overlay */}
                                {!scanned && (
                                    <motion.div
                                        className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center"
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="w-20 h-20 border-t-2 border-[#80163A] rounded-full animate-spin mb-4" />
                                        <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Decrypting Style DNA...</p>
                                    </motion.div>
                                )}

                                {/* --- LEFT: THE "PHOTO" & ID --- */}
                                <div className="md:w-5/12 bg-[#F3F3F3] p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#E5E5E5] relative overflow-hidden flex flex-col justify-between">
                                    {/* Abstract BG Pattern */}
                                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#1A1A1A 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-12">
                                            <Globe className="w-5 h-5 text-[#1A1A1A] opacity-20" />
                                            <QrCode className="w-8 h-8 text-[#1A1A1A] opacity-80" />
                                        </div>

                                        <div className="relative mb-8 group cursor-pointer">
                                            <div className="aspect-[3/4] bg-gray-200 overflow-hidden grayscale contrast-125 border-[8px] border-white shadow-lg relative">
                                                {/* Placeholder for User Avatar */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A]/20 to-transparent z-10" />
                                                <img
                                                    src={profile.userImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop"}
                                                    alt="Style Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <PassportStamp label="Verified" date={today} rotation={-12} />
                                            <div className="absolute -bottom-6 -right-6">
                                                <PassportStamp label="D.Atelier" date="AI-GEN" rotation={15} color="text-[#1A1A1A]" />
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <h2 className="text-3xl font-playfair text-[#1A1A1A] italic mb-1">{profile.primaryStyle || profile.styleType || "Analyzing..."}</h2>
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#9A9A9A]">Primary Archetype</p>
                                        </div>
                                    </div>

                                    {/* Bottom Code */}
                                    <div className="pt-8 border-t border-[#1A1A1A]/10 mt-auto">
                                        <p className="font-mono text-[9px] text-[#9A9A9A] break-all leading-tight opacity-50">
                                            ID: {Math.random().toString(36).substring(2, 15).toUpperCase()} &bull;
                                            SEQ: {Math.floor(Math.random() * 9000) + 1000} &bull;
                                            LOC: GLOBAL
                                        </p>
                                    </div>
                                </div>

                                {/* --- RIGHT: BIOMETRIC DATA --- */}
                                <div className="md:w-7/12 bg-white flex flex-col">
                                    <div className="p-8 md:p-12 flex-1">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h3 className="text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">Style Dossier</h3>
                                                <div className="w-12 h-0.5 bg-[#80163A]" />
                                            </div>
                                            <div className="px-3 py-1 bg-[#F5F5F5] rounded-full text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                LIVE DATA
                                            </div>
                                        </div>

                                        <p className="font-playfair text-xl md:text-2xl text-[#1A1A1A] leading-relaxed mb-10">
                                            "{profile.styleProfile || profile.personalizedAdvice || `A sophisticated approach to ${profile.primaryStyle?.toLowerCase() || "style"}, emphasizing clean lines and timeless elegance.`}"
                                        </p>

                                        <BiometricGrid className="mb-8">
                                            <BiometricItem label="Archetype" value={profile.primaryStyle || "Analyzing..."} icon={Fingerprint} />
                                            <BiometricItem label="Palette" value={profile.colorAnalysis ? "Custom" : (profile.colorSeason || "Determining...")} icon={Palette} />
                                            <BiometricItem label="Wardrobe Size" value={`${profile.itemCount || 0} Items`} icon={CheckCircle2} />
                                            <BiometricItem label="Est. Value" value="Calculating..." icon={CreditCard} />
                                        </BiometricGrid>

                                        {/* Dynamic Sirengths / Patterns */}
                                        <div className="mb-8">
                                            <p className="text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-3">Signature Elements</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(profile.strengths || profile.patterns || []).slice(0, 5).map((tag: string) => (
                                                    <span key={tag} className="px-3 py-1.5 border border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-default">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {(!profile.strengths && !profile.patterns) && (
                                                    <span className="text-xs text-gray-400 italic">No signature elements detected yet.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Development Areas / Opportunities */}
                                        {(profile.developmentAreas || profile.opportunities) && (
                                            <div className="mb-4">
                                                <p className="text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-3">Opportunities</p>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {(profile.developmentAreas || profile.opportunities).slice(0, 4).map((area: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-[#6B6B6B]">
                                                            <span className="text-[#80163A] mt-0.5">•</span>
                                                            {area}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-8 border-t border-[#E5E5E5] bg-[#FAF9F6] flex gap-4">
                                        <Button className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#80163A] h-12 text-xs uppercase tracking-widest rounded-none transition-all">
                                            <Sparkles className="w-3 h-3 mr-2" />
                                            View Curation
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-12 border-[#E5E5E5] rounded-none hover:bg-white hover:border-[#1A1A1A] text-xs uppercase tracking-widest px-6"
                                            onClick={() => {
                                                setScanned(false);
                                                window.location.reload(); // Simple refresh to re-trigger AI analysis as it's not persisted yet
                                            }}
                                        >
                                            <RefreshCw className="w-3 h-3 mr-2" />
                                            Re-Analyze
                                        </Button>
                                        <Button variant="outline" className="h-12 w-12 border-[#E5E5E5] rounded-none hover:bg-white hover:border-[#1A1A1A]">
                                            <Share2 className="w-4 h-4 text-[#1A1A1A]" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Disclaimer / Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-[#9A9A9A] font-light max-w-sm mx-auto">
                            Digital Atelier &copy; {new Date().getFullYear()}. All biometric style verification data is encrypted and stored locally.
                        </p>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

export default StyleProfilePage;
