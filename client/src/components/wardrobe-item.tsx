import { useState } from "react";
import { Heart, HeartOff, Edit, Trash2, MoreHorizontal, Check, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const updateItem = useUpdateWardrobeItem();
  const deleteItem = useDeleteWardrobeItem();

  // Log wear mutation
  const logWearMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/wardrobe/${item.id}/log-wear`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to log wear');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });

  const handleLogWear = () => {
    logWearMutation.mutate();
  };

  const toggleFavorite = async () => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        favorite: !item.favorite,
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
    <>
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
              aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {item.favorite ? (
                <HeartOff className="h-4 w-4" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
            {onEdit && (
              <Button size="sm" variant="secondary" onClick={onEdit} aria-label="Edit item">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              aria-label="Delete item"
            >
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogWear} disabled={logWearMutation.isPending}>
                  <Check className="h-4 w-4 mr-2" />
                  {logWearMutation.isPending ? 'Logging...' : 'Log Wear Today'}
                </DropdownMenuItem>
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
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
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
            {item.wearCount && item.wearCount > 0 && (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                <Clock className="h-3 w-3 mr-1" />
                {item.wearCount}x worn
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Item"
        description={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isLoading={deleteItem.isPending}
      />
    </>
  );
}
