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
  Share2,
  Users2
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
      <div className="luxury-card h-full flex flex-col shadow-md group">
        <div className="relative">
          {mainItem?.imageUrl && (
            <div className="polaroid-frame aspect-[4/3] overflow-hidden">
              <img 
                src={mainItem.imageUrl} 
                alt={outfit.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gold corner accents */}
              <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-accent/80"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-accent/80"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-accent/80"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-accent/80"></div>
            </div>
          )}
          {outfit.favorite && (
            <Badge className="absolute top-4 right-4 bg-accent text-black">
              <Heart className="h-3 w-3 mr-1 fill-current" /> Favorite
            </Badge>
          )}
          
          {/* Season marker on image */}
          {outfit.season && (
            <div className="absolute bottom-0 left-0 bg-background/70 backdrop-blur-sm px-3 py-1 text-xs font-fashion-body tracking-wide">
              {outfit.season.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="p-4 pb-2">
          <h3 className="text-xl mb-2 font-fashion-heading tracking-tight">{outfit.name}</h3>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {outfit.occasion && (
              <Badge variant="outline" className="text-xs border-accent/50 text-foreground">
                {outfit.occasion}
              </Badge>
            )}
            {outfit.weatherConditions && (
              <Badge variant="outline" className="text-xs border-accent/50 text-foreground">
                <Cloud className="h-3 w-3 mr-1" />
                {outfit.weatherConditions}
              </Badge>
            )}
            {outfit.mood && (
              <Badge variant="outline" className="text-xs border-accent/50 text-foreground">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {outfit.mood}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground flex-grow">
            <p className="uppercase tracking-wider text-[10px] font-fashion-body mb-1">OUTFIT PIECES</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {items.length > 0 ? (
                items.slice(0, 4).map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs justify-start truncate bg-background/50 border border-accent/10">
                    {item.name}
                  </Badge>
                ))
              ) : (
                <p className="col-span-2 text-xs italic font-fashion-body">Empty collection</p>
              )}
              {items.length > 4 && (
                <Badge variant="secondary" className="text-xs justify-center bg-accent/10 border border-accent/20">
                  +{items.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-auto border-t border-accent/10 p-3">
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" size="sm" className="hover:text-destructive p-1 h-auto" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <div className="flex -space-x-2">
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="h-7 w-7 rounded-full border border-accent/30 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {items.length > 3 && (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border border-accent/20">
                  +{items.length - 3}
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="sm" className="fashion-button text-[10px] py-1 h-auto px-3" onClick={() => setIsViewDialogOpen(true)}>
              VIEW
            </Button>
          </div>
        </div>
      </div>

      {/* View Outfit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] runway-gradient overflow-hidden p-6">
          {/* Luxury corner accents */}
          <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-accent/40"></div>
          <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-accent/40"></div>
          <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-accent/40"></div>
          <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-accent/40"></div>
          
          <DialogHeader className="text-center">
            <DialogTitle className="font-fashion-heading text-3xl tracking-tight mb-2">{outfit.name}</DialogTitle>
            {outfit.description && (
              <p className="text-sm text-muted-foreground italic mb-3 max-w-md mx-auto">{outfit.description}</p>
            )}
            <DialogDescription>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {outfit.occasion && (
                  <Badge variant="outline" className="border-accent/50 text-foreground">
                    <Users2 className="h-3 w-3 mr-1" />
                    {outfit.occasion}
                  </Badge>
                )}
                {outfit.season && (
                  <Badge variant="outline" className="border-accent/50 text-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {outfit.season}
                  </Badge>
                )}
                {outfit.weatherConditions && (
                  <Badge variant="outline" className="border-accent/50 text-foreground">
                    <Cloud className="h-3 w-3 mr-1" />
                    {outfit.weatherConditions}
                  </Badge>
                )}
                {outfit.mood && (
                  <Badge variant="outline" className="border-accent/50 text-foreground">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {outfit.mood}
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="luxury-divider"></div>

          <div className="py-4 px-2">
            <h3 className="font-fashion-heading text-lg mb-5 uppercase tracking-wide text-center">The Collection</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
              {items.map((item) => (
                <div key={item.id} className="boutique-item group h-full flex flex-col">
                  {item.imageUrl && (
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {item.color && (
                        <span className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-sm border border-accent/20">{item.color}</span>
                      )}
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-3 bg-background/90 backdrop-blur-sm flex-grow">
                    <h4 className="font-fashion-heading font-medium text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.category}
                      {item.subcategory ? ` · ${item.subcategory}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between mt-4 pt-4 border-t border-accent/10">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} 
              className="fashion-button border-accent hover:bg-accent hover:text-black">
              CLOSE
            </Button>
            <Button onClick={handleShare} className="fashion-button">
              <Share2 className="h-4 w-4 mr-2" />
              SHARE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
