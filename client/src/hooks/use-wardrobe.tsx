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
    mutationFn: async (item: Omit<InsertWardrobeItem, "userId">) => {
      const res = await apiRequest("POST", "/api/wardrobe", item);
      return await res.json();
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

export function useUpdateWardrobeItem() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertWardrobeItem>) => {
      const res = await apiRequest("PATCH", `/api/wardrobe/${id}`, data);
      return await res.json();
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
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wardrobe/${id}`);
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
