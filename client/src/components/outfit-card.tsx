import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Trash2, 
  Heart, 
  Calendar, 
  Cloud, 
  ThumbsUp,
  Eye,
  Share2,
  Bookmark,
  Tag
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
import { cn } from "@/lib/utils";

interface OutfitCardProps {
  outfit: Outfit;
  items: WardrobeItem[];
  onDelete: () => void;
}

export default function OutfitCard({ outfit, items, onDelete }: OutfitCardProps) {
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // Generate a random slight rotation for the polaroid effect
  const randomRotation = Math.random() * 3 - 1.5; // Between -1.5 and 1.5 degrees

  return (
    <>
      <motion.div
        initial={{ rotate: randomRotation }}
        whileHover={{ 
          rotate: 0, 
          scale: 1.03, 
          y: -5,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="h-full"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden h-full flex flex-col shadow-lg border-[10px] border-white bg-white">
          <div className="relative">
            {mainItem?.imageUrl && (
              <div className="aspect-[4/3] overflow-hidden">
                <motion.img 
                  src={mainItem.imageUrl} 
                  alt={outfit.name} 
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
            {outfit.favorite && (
              <div className="absolute top-2 right-2">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: isHovered ? Infinity : 0, 
                    repeatDelay: 1
                  }}
                >
                  <Badge className="bg-red-500 shadow-md">
                    <Heart className="h-3 w-3 mr-1 fill-current" /> Favorite
                  </Badge>
                </motion.div>
              </div>
            )}
            
            {/* Date stamp in corner - polaroid-style feature */}
            <div className="absolute bottom-2 right-2 text-xs font-mono text-white bg-black/40 px-2 py-0.5 rounded-sm rotate-[-1deg]">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </div>
          </div>
          
          {/* Light yellow note-like background for content */}
          <div className="bg-amber-50 flex-grow">
            <CardHeader className="pb-1 pt-3 border-b border-amber-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-serif">{outfit.name}</CardTitle>
                <motion.div 
                  whileHover={{ rotate: 20 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Bookmark size={16} className="text-amber-800/40" />
                </motion.div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2 pt-2 flex-grow">
              <div className="flex flex-wrap gap-1 mb-3">
                {outfit.occasion && (
                  <Badge variant="outline" className="text-xs bg-white border-amber-200">
                    {outfit.occasion}
                  </Badge>
                )}
                {outfit.season && (
                  <Badge variant="outline" className="text-xs bg-white border-amber-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {outfit.season}
                  </Badge>
                )}
                {outfit.weatherConditions && (
                  <Badge variant="outline" className="text-xs bg-white border-amber-200">
                    <Cloud className="h-3 w-3 mr-1" />
                    {outfit.weatherConditions}
                  </Badge>
                )}
                {outfit.mood && (
                  <Badge variant="outline" className="text-xs bg-white border-amber-200">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {outfit.mood}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Tag className="h-3 w-3 mr-1 rotate-90" />
                  <p className="font-medium text-amber-800/70">Pieces:</p>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {items.length > 0 ? (
                    items.slice(0, 4).map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs justify-start truncate bg-white text-amber-900">
                        {item.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="col-span-2 text-xs">No items in this outfit</p>
                  )}
                  {items.length > 4 && (
                    <Badge variant="secondary" className="text-xs justify-center bg-amber-100 text-amber-900">
                      +{items.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-3 border-t border-amber-100">
              <div className="flex justify-between items-center w-full">
                <Button variant="ghost" size="sm" className="hover:text-red-500 p-1" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="flex -space-x-3">
                  {items.slice(0, 3).map((item, index) => (
                    <motion.div 
                      key={index} 
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-white overflow-hidden shadow-sm",
                        "ring-1 ring-amber-200"
                      )}
                      whileHover={{ y: -2, zIndex: 10 }}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ))}
                  {items.length > 3 && (
                    <motion.div 
                      className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium border-2 border-white ring-1 ring-amber-200 shadow-sm"
                      whileHover={{ y: -2, zIndex: 10 }}
                    >
                      +{items.length - 3}
                    </motion.div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary p-1" 
                  onClick={() => setIsViewDialogOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>

      {/* View Outfit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-b from-white to-amber-50">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-2xl font-serif">{outfit.name}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {outfit.occasion && (
                  <Badge variant="outline" className="bg-white border-amber-200">
                    {outfit.occasion}
                  </Badge>
                )}
                {outfit.season && (
                  <Badge variant="outline" className="bg-white border-amber-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {outfit.season}
                  </Badge>
                )}
                {outfit.weatherConditions && (
                  <Badge variant="outline" className="bg-white border-amber-200">
                    <Cloud className="h-3 w-3 mr-1" />
                    {outfit.weatherConditions}
                  </Badge>
                )}
                {outfit.mood && (
                  <Badge variant="outline" className="bg-white border-amber-200">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {outfit.mood}
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h3 className="text-lg font-medium mb-3 font-serif">Outfit Items</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <motion.div 
                  key={item.id} 
                  className="border-[6px] border-white rounded-sm overflow-hidden shadow-md bg-white"
                  whileHover={{ 
                    scale: 1.03, 
                    rotate: Math.random() > 0.5 ? 1 : -1,
                    y: -5 
                  }}
                >
                  {item.imageUrl && (
                    <div className="h-40 sm:h-48 overflow-hidden">
                      <motion.img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                  <div className="p-3 bg-amber-50">
                    <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                      {item.subcategory ? ` - ${item.subcategory}` : ""}
                      {item.color ? `, ${item.color}` : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between border-t pt-3">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleShare} className="bg-amber-900 hover:bg-amber-800">
              <Share2 className="h-4 w-4 mr-2" />
              Share Outfit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
