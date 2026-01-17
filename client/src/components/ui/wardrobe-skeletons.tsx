import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function WardrobeGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-3 w-[50%]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function OutfitCardSkeleton() {
    return (
        <Card className="h-full overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
            <Skeleton className="h-64 w-full" />
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </CardContent>
        </Card>
    )
}
