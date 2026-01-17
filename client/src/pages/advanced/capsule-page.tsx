import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { useCapsules, useCreateCapsule } from "@/hooks/use-advanced";
import { Shirt, Plus, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * CAPSULE WARDROBE PAGE
 *
 * Create and manage curated seasonal collections
 */

export default function CapsulePage() {
    const { data: capsules, isLoading } = useCapsules();
    const { mutate: createCapsule } = useCreateCapsule();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    // Form state
    const [newCapsule, setNewCapsule] = useState({
        name: "",
        season: "summer",
        type: "vacation"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createCapsule({
            ...newCapsule,
            items: [], // Start empty
            description: "New collection"
        }, {
            onSuccess: () => {
                setIsOpen(false);
                toast({
                    title: "Capsule Created",
                    description: "Start adding items to your new collection.",
                });
                setNewCapsule({ name: "", season: "summer", type: "vacation" });
            }
        });
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Curated</p>
                        <h1
                            className="text-[#1A1A1A]"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem" }}
                        >
                            Capsule <span className="italic font-light">Wardrobes</span>
                        </h1>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#1A1A1A] text-white rounded-full px-6 h-12 hover:bg-[#80163A] transition-colors">
                                <Plus className="w-5 h-5 mr-2" /> New Capsule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#F9F9F7] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>Create Collection</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Collection Name</Label>
                                    <Input required value={newCapsule.name} onChange={e => setNewCapsule({ ...newCapsule, name: e.target.value })} placeholder="e.g. Paris Trip" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Season</Label>
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={newCapsule.season}
                                            onChange={e => setNewCapsule({ ...newCapsule, season: e.target.value })}
                                        >
                                            <option value="summer">Summer</option>
                                            <option value="winter">Winter</option>
                                            <option value="spring">Spring</option>
                                            <option value="autumn">Autumn</option>
                                            <option value="all">Year-round</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={newCapsule.type}
                                            onChange={e => setNewCapsule({ ...newCapsule, type: e.target.value })}
                                        >
                                            <option value="vacation">Vacation</option>
                                            <option value="work">Workwear</option>
                                            <option value="weekend">Weekend</option>
                                            <option value="party">Events</option>
                                            <option value="seasonal">Seasonal</option>
                                        </select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-[#1A1A1A]">Create Capsule</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#80163A]/20 border-t-[#80163A] animate-spin" /></div>
                ) : !capsules || capsules.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-[#E5E5E5] flex flex-col items-center">
                        <Layers className="w-12 h-12 text-[#D5D5D5] mb-4" />
                        <h3 className="text-xl font-serif text-[#1A1A1A]">No capsules yet</h3>
                        <p className="text-[#6B6B6B] mt-2 max-w-sm">Create curated collections for trips, seasons, or specific themes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {capsules.map((capsule) => (
                            <motion.div
                                key={capsule.id}
                                layout
                                className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden group hover:border-[#80163A] transition-colors p-6 flex flex-col min-h-[200px]"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#80163A]">{capsule.season}</span>
                                            <span className="text-[#D5D5D5]">•</span>
                                            <span className="text-xs text-[#6B6B6B] uppercase">{capsule.type}</span>
                                        </div>
                                        <h3 className="text-2xl font-serif text-[#1A1A1A]">{capsule.name}</h3>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Layers className="w-5 h-5 text-[#D5D5D5] group-hover:text-[#1A1A1A]" />
                                    </Button>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                                        <Shirt className="w-4 h-4" />
                                        <span>{capsule.items?.length || 0} items</span>
                                    </div>

                                    {/* Preview of items would go here */}
                                    <div className="mt-4 flex -space-x-2">
                                        {/* Placeholder for item preview circles */}
                                        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border border-white" />
                                        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border border-white" />
                                        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border border-white flex items-center justify-center text-[10px] text-[#6B6B6B]">+</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
