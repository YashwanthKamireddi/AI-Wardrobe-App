import { useState } from "react";
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
  Sun
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

interface WardrobeItemProps {
  item: WardrobeItemType;
  onDelete: () => void;
}

export default function WardrobeItem({ item, onDelete }: WardrobeItemProps) {
  const [isHovered, setIsHovered] = useState(false);
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
    <Card 
      className="overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        </div>
        
        {item.favorite && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            <Heart className="h-3 w-3 mr-1 fill-current" />
          </Badge>
        )}
        
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white text-black hover:bg-white/90 mr-2"
            onClick={toggleFavorite}
          >
            {item.favorite ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
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
            <DropdownMenuContent align="end">
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
            <Badge variant="outline" className="text-xs">
              {seasonIcon()}
              {item.season === "all" ? "All seasons" : item.season}
            </Badge>
          )}
          {item.tags && item.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {item.tags[0]}
              {item.tags.length > 1 ? ` +${item.tags.length - 1}` : ''}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
