import { useState } from "react";
import { format } from "date-fns";
import { Clock, Star, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WearTrackingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: {
        id: number;
        name: string;
        imageUrl: string;
    };
    outfitId?: number;
}

const OCCASIONS = [
    { value: "work", label: "Work" },
    { value: "casual", label: "Casual" },
    { value: "date", label: "Date Night" },
    { value: "formal", label: "Formal Event" },
    { value: "party", label: "Party" },
    { value: "wedding", label: "Wedding" },
    { value: "travel", label: "Travel" },
    { value: "exercise", label: "Exercise" },
    { value: "other", label: "Other" },
];

export function WearTrackingDialog({
    open,
    onOpenChange,
    item,
    outfitId,
}: WearTrackingDialogProps) {
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [occasion, setOccasion] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [rating, setRating] = useState<number>(0);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createWearLog = useMutation({
        mutationFn: async (data: {
            wardrobeItemId?: number;
            outfitId?: number;
            wornDate: string;
            occasion: string;
            notes: string;
            rating: number;
        }) => {
            const response = await fetch("/api/wear-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    wornDate: new Date(data.wornDate).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to log wear");
            }

            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Wear logged!",
                description: item
                    ? `${item.name} marked as worn.`
                    : "Outfit marked as worn.",
            });
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
            queryClient.invalidateQueries({ queryKey: ["/api/wear-log"] });
            if (item) {
                queryClient.invalidateQueries({
                    queryKey: [`/api/wardrobe/${item.id}/wear-log`],
                });
            }
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to log wear. Please try again.",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setDate(format(new Date(), "yyyy-MM-dd"));
        setOccasion("");
        setNotes("");
        setRating(0);
    };

    const handleSubmit = () => {
        createWearLog.mutate({
            wardrobeItemId: item?.id,
            outfitId: outfitId,
            wornDate: date,
            occasion: occasion,
            notes: notes,
            rating: rating || 0,
        });
    };

    const handleQuickWear = () => {
        createWearLog.mutate({
            wardrobeItemId: item?.id,
            outfitId: outfitId,
            wornDate: format(new Date(), "yyyy-MM-dd"),
            occasion: "",
            notes: "",
            rating: 0,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Log Wear
                    </DialogTitle>
                    <DialogDescription>
                        {item
                            ? `Track when you wore "${item.name}"`
                            : "Track when you wore this outfit"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Item preview */}
                    {item && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-16 w-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Tracking wear</p>
                            </div>
                        </div>
                    )}

                    {/* Quick wear button */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleQuickWear}
                        disabled={createWearLog.isPending}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Worn Today
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or add details
                            </span>
                        </div>
                    </div>

                    {/* Date picker - using native input */}
                    <div className="space-y-2">
                        <Label htmlFor="wear-date">Date Worn</Label>
                        <Input
                            id="wear-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={format(new Date(), "yyyy-MM-dd")}
                        />
                    </div>

                    {/* Occasion */}
                    <div className="space-y-2">
                        <Label>Occasion</Label>
                        <Select value={occasion} onValueChange={setOccasion}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select occasion (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {OCCASIONS.map((occ) => (
                                    <SelectItem key={occ.value} value={occ.value}>
                                        {occ.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label>How did you feel? (optional)</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star === rating ? 0 : star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`h-6 w-6 ${star <= rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes - using Input since Textarea doesn't exist */}
                    <div className="space-y-2">
                        <Label htmlFor="wear-notes">Notes (optional)</Label>
                        <Input
                            id="wear-notes"
                            placeholder="Any thoughts about wearing this?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={createWearLog.isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={createWearLog.isPending}>
                        {createWearLog.isPending ? "Saving..." : "Log Wear"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default WearTrackingDialog;
