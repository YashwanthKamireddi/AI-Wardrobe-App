import { useState } from "react";
import { Heart, HeartOff, Edit, Trash2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { WardrobeItem as WardrobeItemType } from "@shared/schema";
import { useUpdateWardrobeItem, useDeleteWardrobeItem } from "@/hooks/use-wardrobe";

interface WardrobeItemProps {
  item: WardrobeItemType;
  onEdit?: () => void;
}

export default function WardrobeItem({ item, onEdit }: WardrobeItemProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const updateItem = useUpdateWardrobeItem();
  const deleteItem = useDeleteWardrobeItem();

  const toggleFavorite = async () => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        data: { favorite: !item.favorite },
      });
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem.mutateAsync(item.id);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-muted">
        {item.imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <Skeleton className="absolute inset-0" />
            )}
            <img
              src={item.imageUrl}
              alt={item.name}
              className={`w-full h-full object-cover transition-opacity ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        
        {/* Favorite badge */}
        {item.favorite && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            <Heart className="h-3 w-3 fill-current" />
          </Badge>
        )}
        
        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleFavorite}
          >
            {item.favorite ? (
              <HeartOff className="h-4 w-4" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground capitalize truncate">
              {item.category}
              {item.subcategory && ` · ${item.subcategory}`}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFavorite}>
                {item.favorite ? (
                  <>
                    <HeartOff className="h-4 w-4 mr-2" />
                    Remove Favorite
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Item
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {item.color && (
            <Badge variant="outline" className="text-xs">
              {item.color}
            </Badge>
          )}
          {item.season && item.season !== "all" && (
            <Badge variant="secondary" className="text-xs capitalize">
              {item.season}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
