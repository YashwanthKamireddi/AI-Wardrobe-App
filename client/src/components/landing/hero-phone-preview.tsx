import { motion } from "framer-motion";
import { Cloud, Sun, Shirt, RefreshCw } from "lucide-react";

/**
 * A mockup that mirrors the actual Home Page UI.
 * This ensures "truth in advertising" on the landing page.
 */
export function HeroPhonePreview() {
    return (
        <div className="relative w-[320px] md:w-[350px] aspect-[9/19] bg-[#F9F9F7] rounded-[40px] shadow-2xl border-8 border-[#1a1a1a] overflow-hidden select-none">
            {/* Status Bar Mockup */}
            <div className="h-12 w-full flex justify-between items-center px-6 pt-3">
                <span className="text-[10px] font-bold">9:41</span>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-[#1a1a1a] rounded-full opacity-20" />
                    <div className="w-3 h-3 bg-[#1a1a1a] rounded-full opacity-20" />
                    <div className="w-3 h-3 bg-[#1a1a1a] rounded-full" />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-8">

                {/* 1. Header (Mirrors HomePage) */}
                <div>
                    <p className="text-[10px] font-bold tracking-widest text-[#80163a] uppercase mb-2">Friday, October 24</p>
                    <h2 className="text-3xl font-playfair leading-tight text-[#1a1a1a]">
                        Good Morning, <br />
                        <span className="text-[#666]">Anna.</span>
                    </h2>
                </div>

                {/* 2. Weather Pill (Mirrors HomePage) */}
                <div className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-white border border-[#E5E5E5] shadow-sm w-fit">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">18° Cloudy</p>
                    </div>
                </div>

                {/* 3. Today's Outfit Card (Mirrors AIStylistMinimal) */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#FDFBF7] to-white rounded-2xl blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#999]">Today's Look</span>
                            <div className="p-1.5 rounded-full bg-[#FAFAFA] text-[#80163a]">
                                <RefreshCw className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Outfit Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {/* Top */}
                            <div className="aspect-[3/4] bg-[#F5F5F5] rounded-lg relative overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80" className="w-full h-full object-cover" />
                            </div>
                            {/* Bottom */}
                            <div className="aspect-[3/4] bg-[#F5F5F5] rounded-lg relative overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&q=80" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-playfair italic">"Office Casual"</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                                <div className="w-2 h-2 rounded-full bg-[#ddd]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Nav Mockup */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between px-2 opacity-50">
                    <div className="flex flex-col items-center gap-1"><div className="w-5 h-5 bg-[#1a1a1a] rounded shadow-sm" /></div>
                    <div className="flex flex-col items-center gap-1"><div className="w-5 h-5 bg-[#e5e5e5] rounded" /></div>
                    <div className="flex flex-col items-center gap-1"><div className="w-5 h-5 bg-[#e5e5e5] rounded" /></div>
                    <div className="flex flex-col items-center gap-1"><div className="w-5 h-5 bg-[#e5e5e5] rounded" /></div>
                </div>
            </div>

            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-xl" />
        </div>
    );
}
