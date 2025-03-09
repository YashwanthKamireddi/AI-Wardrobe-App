import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Edit, 
  Heart, 
  HeartOff, 
  MoreVertical, 
  Snowflake, 
  CloudSun, 
  Cloud, 
  Sun,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useUpdateWardrobeItem } from "@/hooks/use-wardrobe";
import { WardrobeItem as WardrobeItemType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedWardrobeItem, wardrobeAnimations } from "@/components/ui/animated-wardrobe";

interface WardrobeItemProps {
  item: WardrobeItemType;
  onDelete: () => void;
}

export default function WardrobeItem({ item, onDelete }: WardrobeItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const updateItem = useUpdateWardrobeItem();

  const toggleFavorite = () => {
    updateItem.mutate({
      id: item.id,
      favorite: !item.favorite
    });
  };

  const seasonIcon = () => {
    switch (item.season) {
      case "winter": return <Snowflake className="h-3 w-3 mr-1" />;
      case "spring": return <CloudSun className="h-3 w-3 mr-1" />;
      case "summer": return <Sun className="h-3 w-3 mr-1" />;
      case "fall": return <Cloud className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <AnimatedWardrobeItem 
      animationType="popUp"
      className="w-full h-full"
    >
      <Card 
        className="overflow-hidden h-full transform transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
            <motion.img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              initial={false}
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                filter: isHovered ? "brightness(1.1)" : "brightness(1)" 
              }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>

          <AnimatePresence>
            {item.favorite && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2"
              >
                <Badge className="bg-red-500">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={toggleFavorite}
                  >
                    {item.favorite ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                  </Button>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <motion.h3 
                className="font-medium text-sm truncate"
                initial={false}
                animate={{ color: isHovered ? "hsl(var(--primary))" : "currentColor" }}
              >
                {item.name}
              </motion.h3>
              <p className="text-xs text-muted-foreground truncate">
                {item.subcategory || item.category}
                {item.color && ` • ${item.color}`}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="cursor-pointer" onClick={toggleFavorite}>
                  {item.favorite ? (
                    <>
                      <HeartOff className="h-4 w-4 mr-2" />
                      Remove from favorites
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Add to favorites
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <div className="flex flex-wrap gap-1">
            {item.season && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="outline" className="text-xs">
                  {seasonIcon()}
                  {item.season === "all" ? "All seasons" : item.season}
                </Badge>
              </motion.div>
            )}
            {item.tags && item.tags.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="secondary" className="text-xs">
                  {item.tags[0]}
                  {item.tags.length > 1 ? ` +${item.tags.length - 1}` : ''}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardFooter>
      </Card>
    </AnimatedWardrobeItem>
  );
}