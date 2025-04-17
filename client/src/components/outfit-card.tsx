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

/**
 * OutfitCard Component
 * 
 * A luxurious, interactive card component that displays outfit information with sophisticated
 * styling and animations. The component shows a preview of the outfit with a main image,
 * outfit details, and associated wardrobe items. It features a detailed popup dialog when
 * the user clicks to view more details.
 * 
 * @component
 * @example
 * // Basic usage in an outfits grid
 * <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 *   {outfits.map((outfit) => (
 *     <OutfitCard 
 *       key={outfit.id}
 *       outfit={outfit}
 *       items={wardrobeItems.filter(item => outfit.itemIds.includes(item.id))}
 *       onDelete={() => handleDeleteOutfit(outfit.id)}
 *     />
 *   ))}
 * </div>
 * 
 * @styling
 * - Luxury-inspired card design with gold corner accents
 * - Responsive polaroid-style image frame
 * - Hover animations with subtle scaling effects
 * - Custom badge styling to indicate outfit attributes (weather, season, mood)
 * - Interactive item thumbnails and sharing options
 * - Fixed, centered dialog position with proper overflow handling
 * 
 * @features
 * - Dynamic organization of items by category for more logical display
 * - Main image selection based on priority (dresses, then tops, then any item)
 * - Elegant item preview with image thumbnails
 * - Detailed dialog view with scrollable item grid
 * - Share and delete functionality
 * 
 * @props
 * - outfit: The outfit object containing all outfit metadata
 * - items: Array of wardrobe items associated with this outfit
 * - onDelete: Callback function to execute when delete button is clicked
 */
interface OutfitCardProps {
  /** The complete outfit object with all metadata */
  outfit: Outfit;
  /** Array of wardrobe items that are part of this outfit */
  items: WardrobeItem[];
  /** Callback function to handle outfit deletion */
  onDelete: () => void;
}

/**
 * Outfit Card Component
 *
 * Renders a luxurious card displaying outfit details with sophisticated animations and
 * interaction patterns. The card shows a summary view with the ability to expand into
 * a detailed dialog. All styling follows a premium fashion aesthetic.
 *
 * @param {OutfitCardProps} props - The component props
 * @returns {JSX.Element} The rendered outfit card with optional dialog
 */
export default function OutfitCard({ outfit, items, onDelete }: OutfitCardProps) {
  /** Toast hook for displaying notifications */
  const { toast } = useToast();
  
  /** State to control the visibility of the detailed view dialog */
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  /**
   * Organizes wardrobe items by category for more logical display
   * This helps with selecting the main display image and organizing items in the detail view
   */
  const organizedItems = {
    tops: items.filter(item => item.category === "tops"),
    bottoms: items.filter(item => item.category === "bottoms"),
    dresses: items.filter(item => item.category === "dresses"),
    outerwear: items.filter(item => item.category === "outerwear"),
    shoes: items.filter(item => item.category === "shoes"),
    accessories: items.filter(item => item.category === "accessories"),
    makeup: items.filter(item => item.category === "makeup")
  };
  
  /**
   * Selects the main item to display as the card image
   * Prioritizes dresses, then tops, then falls back to the first item
   * This ensures the most visually appealing item represents the outfit
   */
  const mainItem = organizedItems.dresses[0] || organizedItems.tops[0] || items[0];

  /**
   * Handles the share button click
   * Currently shows a toast notification for the upcoming feature
   */
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
        <DialogContent 
          className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto p-6 rounded-lg runway-gradient grid grid-cols-1 gap-4">
          {/* Luxury corner accents */}
          <div className="absolute top-3 left-3 w-4 h-4 sm:w-5 sm:h-5 border-l-2 border-t-2 border-accent/40"></div>
          <div className="absolute top-3 right-3 w-4 h-4 sm:w-5 sm:h-5 border-r-2 border-t-2 border-accent/40"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 sm:w-5 sm:h-5 border-l-2 border-b-2 border-accent/40"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 sm:w-5 sm:h-5 border-r-2 border-b-2 border-accent/40"></div>
          
          <DialogDescription className="sr-only">Outfit details and contents</DialogDescription>
          
          <DialogHeader className="text-center mb-0">
            <DialogTitle className="font-fashion-heading text-xl sm:text-3xl tracking-tight">{outfit.name}</DialogTitle>
            {outfit.description && (
              <div className="text-xs sm:text-sm text-muted-foreground italic mt-1 max-w-md mx-auto">{outfit.description}</div>
            )}
            <div className="mt-2">
              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                {outfit.occasion && (
                  <Badge variant="outline" className="border-accent/50 text-foreground text-xs py-0">
                    <Users2 className="h-3 w-3 mr-1" />
                    {outfit.occasion}
                  </Badge>
                )}
                {outfit.season && (
                  <Badge variant="outline" className="border-accent/50 text-foreground text-xs py-0">
                    <Calendar className="h-3 w-3 mr-1" />
                    {outfit.season}
                  </Badge>
                )}
                {outfit.weatherConditions && (
                  <Badge variant="outline" className="border-accent/50 text-foreground text-xs py-0">
                    <Cloud className="h-3 w-3 mr-1" />
                    {outfit.weatherConditions}
                  </Badge>
                )}
                {outfit.mood && (
                  <Badge variant="outline" className="border-accent/50 text-foreground text-xs py-0">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {outfit.mood}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="luxury-divider my-0"></div>

          <div className="w-full">
            <h3 className="font-fashion-heading text-lg sm:text-xl mb-3 uppercase tracking-wide text-center">The Collection</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-h-[40vh] sm:max-h-[45vh] overflow-y-auto custom-scrollbar p-1">
              {items.map((item) => (
                <div key={item.id} className="boutique-item group h-full flex flex-col border border-accent/20 rounded-sm overflow-hidden bg-card shadow-sm">
                  {item.imageUrl && (
                    <div className="relative overflow-hidden aspect-square">
                      {item.color && (
                        <span className="absolute top-1 right-1 z-10 bg-background/80 backdrop-blur-sm text-[10px] sm:text-xs px-1 py-0.5 sm:px-2 sm:py-1 rounded-sm border border-accent/20">{item.color}</span>
                      )}
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-2 bg-background/90 backdrop-blur-sm flex-grow">
                    <h4 className="font-fashion-heading font-medium text-xs sm:text-sm mb-0.5 truncate">{item.name}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
                      {item.category}
                      {item.subcategory ? ` · ${item.subcategory}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-0 pt-2 border-t border-accent/10">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} 
              className="fashion-button border-accent hover:bg-accent hover:text-black px-4 h-10 text-sm">
              CLOSE
            </Button>
            <Button onClick={handleShare} className="fashion-button px-4 h-10 text-sm">
              <Share2 className="h-4 w-4 mr-2" />
              SHARE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
