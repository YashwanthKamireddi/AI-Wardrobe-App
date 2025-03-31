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
  CloudIcon, 
  SunIcon, 
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
      case "spring": return (
        <span className="relative h-3 w-3 mr-1 inline-block">
          <CloudIcon className="h-3 w-3 absolute" />
          <SunIcon className="h-2 w-2 absolute right-0 bottom-0" />
        </span>
      );
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
        className="overflow-hidden h-full transform transition-all duration-300 hover:shadow-lg border-amber-200/50 luxury-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-amber-50/30">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full bg-amber-100/30" />
              </div>
            )}
            <motion.img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              initial={false}
              animate={{ 
                scale: isHovered ? 1.08 : 1,
                filter: isHovered ? "brightness(1.05)" : "brightness(1)" 
              }}
              transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>

          {/* Gold corner accents */}
          <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-5 h-1 bg-amber-400/70"></div>
            <div className="absolute top-0 left-0 w-1 h-5 bg-amber-400/70"></div>
          </div>
          <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-5 h-1 bg-amber-400/70"></div>
            <div className="absolute bottom-0 right-0 w-1 h-5 bg-amber-400/70"></div>
          </div>

          <AnimatePresence>
            {item.favorite && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2 z-10"
              >
                <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-600">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Favorite
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
                className="absolute inset-0 bg-gradient-to-b from-amber-800/40 to-amber-950/60 flex items-center justify-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-white/90 text-amber-900 hover:bg-white border-amber-300 hover:text-amber-600"
                    onClick={toggleFavorite}
                  >
                    {item.favorite ? (
                      <HeartOff className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Heart className="h-4 w-4 text-amber-600" />
                    )}
                  </Button>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-white/90 text-red-600 hover:bg-white border-amber-300"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-3 bg-white">
          <div className="flex justify-between items-start">
            <div className="w-[80%]">
              <motion.h3 
                className="font-luxury-body text-sm font-semibold truncate text-amber-900"
                initial={false}
                animate={{ color: isHovered ? "hsl(36, 80%, 45%)" : "" }}
              >
                {item.name}
              </motion.h3>
              <p className="text-xs text-amber-700/80 truncate font-luxury-body">
                {item.subcategory || item.category}
                {item.color && ` • ${item.color}`}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] border-amber-200 bg-white">
                <DropdownMenuItem className="cursor-pointer font-luxury-body text-amber-900" onClick={toggleFavorite}>
                  {item.favorite ? (
                    <>
                      <HeartOff className="h-4 w-4 mr-2 text-amber-500" />
                      Remove from favorites
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2 text-amber-500" />
                      Add to favorites
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer font-luxury-body text-amber-900">
                  <Edit className="h-4 w-4 mr-2 text-amber-500" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-amber-200/50" />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-700 font-luxury-body"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 bg-white">
          <div className="flex flex-wrap gap-1 mt-1">
            {item.season && (
              <motion.div whileHover={{ scale: 1.05, y: -1 }}>
                <Badge variant="outline" className="text-xs border-amber-200 text-amber-800 font-luxury-body">
                  {seasonIcon()}
                  {item.season === "all" ? "All seasons" : item.season}
                </Badge>
              </motion.div>
            )}
            {item.tags && item.tags.length > 0 && (
              <motion.div whileHover={{ scale: 1.05, y: -1 }}>
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 font-luxury-body">
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