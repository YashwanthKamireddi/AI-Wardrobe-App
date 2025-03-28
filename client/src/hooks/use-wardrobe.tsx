import { useQuery, useMutation } from "@tanstack/react-query";
import { WardrobeItem, InsertWardrobeItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useWardrobeItems() {
  return useQuery<WardrobeItem[], Error>({
    queryKey: ["/api/wardrobe"],
  });
}

export function useWardrobeItem(id: number) {
  return useQuery<WardrobeItem, Error>({
    queryKey: ["/api/wardrobe", id],
    enabled: !!id,
  });
}

export function useAddWardrobeItem() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (item: Omit<InsertWardrobeItem, "userId">) => {
      return apiRequest({
        path: "/api/wardrobe",
        method: "POST",
        body: item
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
      toast({
        title: "Item added",
        description: "Your item has been added to your wardrobe.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBulkAddWardrobeItems() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (items: Omit<InsertWardrobeItem, "userId">[]) => {
      return apiRequest({
        path: "/api/wardrobe/bulk",
        method: "POST",
        body: { items }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
      toast({
        title: "Items added",
        description: `${data.items.length} items have been added to your wardrobe.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add items",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateWardrobeItem() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<InsertWardrobeItem>) => {
      return apiRequest({
        path: `/api/wardrobe/${id}`,
        method: "PATCH",
        body: data
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe", variables.id] });
      toast({
        title: "Item updated",
        description: "Your wardrobe item has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteWardrobeItem() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => {
      return apiRequest({
        path: `/api/wardrobe/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from your wardrobe.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useWardrobeItemsByCategory(category: string) {
  const { data: allItems, isLoading, error } = useWardrobeItems();
  
  const filteredItems = allItems?.filter(item => item.category === category) || [];
  
  return {
    data: filteredItems,
    isLoading,
    error
  };
}
