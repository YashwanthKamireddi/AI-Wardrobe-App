import { useState, useCallback, useRef } from "react";

/**
 * OPTIMISTIC UI HOOK FOR IMAGE UPLOADS
 *
 * Implements the "Instant" flow from the luxury engineering spec:
 * 1. User snaps a photo
 * 2. App immediately adds photo to grid (with processing state)
 * 3. Upload and segmentation happen in background
 * 4. Once complete, smooth cross-fade to processed image
 *
 * Key principle: User is never blocked - they can continue
 * photographing while AI catches up.
 */

export type UploadStatus =
  | "pending"      // Just added, waiting to upload
  | "uploading"    // Upload in progress
  | "processing"   // Server processing (AI/background removal)
  | "complete"     // Successfully processed
  | "error";       // Failed

export interface OptimisticItem {
  id: string;
  localUri: string;      // Local file URI for immediate display
  remoteUri?: string;    // Server URL after upload
  processedUri?: string; // Final processed image URL
  status: UploadStatus;
  progress: number;      // 0-100
  error?: string;
  createdAt: number;
}

interface UseOptimisticUploadOptions {
  onUpload: (file: File) => Promise<{ url: string }>;
  onProcess?: (url: string) => Promise<{ processedUrl: string }>;
  onComplete?: (item: OptimisticItem) => void;
  onError?: (id: string, error: Error) => void;
  maxConcurrent?: number;
}

export function useOptimisticUpload({
  onUpload,
  onProcess,
  onComplete,
  onError,
  maxConcurrent = 3,
}: UseOptimisticUploadOptions) {
  const [items, setItems] = useState<Map<string, OptimisticItem>>(new Map());
  const uploadQueue = useRef<string[]>([]);
  const activeUploads = useRef(0);

  // Generate unique ID for each upload
  const generateId = () => `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Update a single item
  const updateItem = useCallback((id: string, updates: Partial<OptimisticItem>) => {
    setItems(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  // Process the upload queue
  const processQueue = useCallback(async () => {
    while (uploadQueue.current.length > 0 && activeUploads.current < maxConcurrent) {
      const id = uploadQueue.current.shift();
      if (!id) continue;

      const item = items.get(id);
      if (!item || item.status !== "pending") continue;

      activeUploads.current++;

      try {
        // Stage 1: Upload
        updateItem(id, { status: "uploading", progress: 10 });

        // Convert local URI to File object
        const response = await fetch(item.localUri);
        const blob = await response.blob();
        const file = new File([blob], `upload-${id}.jpg`, { type: "image/jpeg" });

        updateItem(id, { progress: 30 });

        const { url } = await onUpload(file);
        updateItem(id, { remoteUri: url, progress: 50 });

        // Stage 2: Process (if handler provided)
        if (onProcess) {
          updateItem(id, { status: "processing", progress: 60 });

          const { processedUrl } = await onProcess(url);
          updateItem(id, {
            processedUri: processedUrl,
            status: "complete",
            progress: 100
          });
        } else {
          updateItem(id, { status: "complete", progress: 100 });
        }

        // Notify completion
        const completedItem = items.get(id);
        if (completedItem && onComplete) {
          onComplete({ ...completedItem, status: "complete", progress: 100 });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        updateItem(id, { status: "error", error: errorMessage });

        if (onError) {
          onError(id, error instanceof Error ? error : new Error(errorMessage));
        }
      } finally {
        activeUploads.current--;
        // Continue processing queue
        processQueue();
      }
    }
  }, [items, maxConcurrent, onUpload, onProcess, onComplete, onError, updateItem]);

  // Add new file optimistically
  const addFile = useCallback((file: File | Blob): string => {
    const id = generateId();
    const localUri = URL.createObjectURL(file);

    const newItem: OptimisticItem = {
      id,
      localUri,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    };

    setItems(prev => {
      const newMap = new Map(prev);
      newMap.set(id, newItem);
      return newMap;
    });

    uploadQueue.current.push(id);

    // Start processing if not at max
    setTimeout(() => processQueue(), 0);

    return id;
  }, [processQueue]);

  // Add multiple files
  const addFiles = useCallback((files: FileList | File[]): string[] => {
    return Array.from(files).map(file => addFile(file));
  }, [addFile]);

  // Retry failed upload
  const retry = useCallback((id: string) => {
    const item = items.get(id);
    if (!item || item.status !== "error") return;

    updateItem(id, { status: "pending", progress: 0, error: undefined });
    uploadQueue.current.push(id);
    processQueue();
  }, [items, processQueue, updateItem]);

  // Remove item (cleanup)
  const remove = useCallback((id: string) => {
    setItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(id);
      if (item?.localUri) {
        URL.revokeObjectURL(item.localUri);
      }
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // Clear all completed
  const clearCompleted = useCallback(() => {
    setItems(prev => {
      const newMap = new Map(prev);
      for (const [id, item] of newMap) {
        if (item.status === "complete") {
          if (item.localUri) URL.revokeObjectURL(item.localUri);
          newMap.delete(id);
        }
      }
      return newMap;
    });
  }, []);

  // Get items as array (sorted by creation time)
  const itemsArray = Array.from(items.values()).sort((a, b) => b.createdAt - a.createdAt);

  // Stats
  const stats = {
    total: items.size,
    pending: itemsArray.filter(i => i.status === "pending").length,
    uploading: itemsArray.filter(i => i.status === "uploading").length,
    processing: itemsArray.filter(i => i.status === "processing").length,
    complete: itemsArray.filter(i => i.status === "complete").length,
    error: itemsArray.filter(i => i.status === "error").length,
    inProgress: itemsArray.filter(i => ["pending", "uploading", "processing"].includes(i.status)).length,
  };

  return {
    items: itemsArray,
    itemsMap: items,
    stats,
    addFile,
    addFiles,
    retry,
    remove,
    clearCompleted,
    isUploading: stats.inProgress > 0,
  };
}

/**
 * Hook for optimistic mutations (non-file operations)
 */
interface OptimisticMutationOptions<T, R> {
  mutationFn: (data: T) => Promise<R>;
  onOptimisticUpdate?: (data: T) => void;
  onSuccess?: (result: R, data: T) => void;
  onError?: (error: Error, data: T) => void;
  onSettled?: () => void;
}

export function useOptimisticMutation<T, R>({
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
  onSettled,
}: OptimisticMutationOptions<T, R>) {
  const [isPending, setIsPending] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const mutate = useCallback(async (data: T) => {
    setIsPending(true);
    setIsOptimistic(true);

    // Apply optimistic update immediately
    if (onOptimisticUpdate) {
      onOptimisticUpdate(data);
    }

    try {
      const result = await mutationFn(data);
      setIsOptimistic(false);

      if (onSuccess) {
        onSuccess(result, data);
      }

      return result;
    } catch (error) {
      setIsOptimistic(false);

      if (onError) {
        onError(error instanceof Error ? error : new Error("Mutation failed"), data);
      }

      throw error;
    } finally {
      setIsPending(false);
      if (onSettled) {
        onSettled();
      }
    }
  }, [mutationFn, onOptimisticUpdate, onSuccess, onError, onSettled]);

  return {
    mutate,
    isPending,
    isOptimistic,
  };
}

export default useOptimisticUpload;
