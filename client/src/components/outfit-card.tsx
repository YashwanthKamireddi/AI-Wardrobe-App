import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Heart, 
  Calendar, 
  Cloud, 
  ThumbsUp,
  Eye,
  Share2 
} from "lucide-react";
import { Outfit, WardrobeItem } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface OutfitCardProps {
  outfit: Outfit;
  items: WardrobeItem[];
  onDelete: () => void;
}

export default function OutfitCard({ outfit, items, onDelete }: OutfitCardProps) {
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Organize items by category for more logical display
  const organizedItems = {
    tops: items.filter(item => item.category === "tops"),
    bottoms: items.filter(item => item.category === "bottoms"),
    dresses: items.filter(item => item.category === "dresses"),
    outerwear: items.filter(item => item.category === "outerwear"),
    shoes: items.filter(item => item.category === "shoes"),
    accessories: items.filter(item => item.category === "accessories"),
    makeup: items.filter(item => item.category === "makeup")
  };
  
  // Get the main item for card display (prioritize dresses, then tops)
  const mainItem = organizedItems.dresses[0] || organizedItems.tops[0] || items[0];

  const handleShare = () => {
    toast({
      title: "Sharing coming soon",
      description: "Outfit sharing functionality will be available soon!",
    });
  };
  
  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative">
          {mainItem?.imageUrl && (
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={mainItem.imageUrl} 
                alt={outfit.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {outfit.favorite && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              <Heart className="h-3 w-3 mr-1 fill-current" /> Favorite
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{outfit.name}</CardTitle>
        </CardHeader>
        
        <CardContent className="pb-2 flex-grow">
          <div className="flex flex-wrap gap-1 mb-3">
            {outfit.occasion && (
              <Badge variant="outline" className="text-xs">
                {outfit.occasion}
              </Badge>
            )}
            {outfit.season && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {outfit.season}
              </Badge>
            )}
            {outfit.weatherConditions && (
              <Badge variant="outline" className="text-xs">
                <Cloud className="h-3 w-3 mr-1" />
                {outfit.weatherConditions}
              </Badge>
            )}
            {outfit.mood && (
              <Badge variant="outline" className="text-xs">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {outfit.mood}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Items included:</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {items.length > 0 ? (
                items.slice(0, 5).map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs justify-start truncate">
                    {item.name}
                  </Badge>
                ))
              ) : (
                <p className="col-span-2 text-xs">No items in this outfit</p>
              )}
              {items.length > 5 && (
                <Badge variant="secondary" className="text-xs justify-center">
                  +{items.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" size="sm" className="hover:text-red-500" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <div className="flex -space-x-2">
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {items.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{items.length - 3}
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => setIsViewDialogOpen(true)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* View Outfit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{outfit.name}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {outfit.occasion && (
                  <Badge variant="outline">
                    {outfit.occasion}
                  </Badge>
                )}
                {outfit.season && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {outfit.season}
                  </Badge>
                )}
                {outfit.weatherConditions && (
                  <Badge variant="outline">
                    <Cloud className="h-3 w-3 mr-1" />
                    {outfit.weatherConditions}
                  </Badge>
                )}
                {outfit.mood && (
                  <Badge variant="outline">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {outfit.mood}
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h3 className="text-lg font-medium mb-3">Outfit Items</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-md overflow-hidden">
                  {item.imageUrl && (
                    <div className="h-40 sm:h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                      {item.subcategory ? ` - ${item.subcategory}` : ""}
                      {item.color ? `, ${item.color}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Outfit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
