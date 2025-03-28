import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Trash2, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BulkFileUploadProps {
  onUpload: (urls: string[]) => void;
  maxImages?: number;
}

export default function BulkFileUpload({ onUpload, maxImages = 10 }: BulkFileUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    
    const newPreviews: string[] = [];
    let filesProcessed = 0;
    
    // Process each file
    Array.from(files).forEach((file) => {
      if (previews.length + newPreviews.length >= maxImages) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newPreviews.push(result);
        
        filesProcessed++;
        if (filesProcessed === Math.min(files.length, maxImages - previews.length)) {
          // All files processed
          const allPreviews = [...previews, ...newPreviews];
          setPreviews(allPreviews);
          onUpload(allPreviews);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleRemoveImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    onUpload(newPreviews);
  };
  
  const handleRemoveAllImages = () => {
    setPreviews([]);
    onUpload([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">
              {previews.length} item{previews.length > 1 ? 's' : ''} selected
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemoveAllImages}
              className="text-xs h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <AnimatePresence>
              {previews.map((preview, index) => (
                <motion.div
                  key={`${preview.substring(0, 20)}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-square rounded-md overflow-hidden border group"
                >
                  <img 
                    src={preview} 
                    alt={`Upload preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </motion.div>
              ))}
              
              {/* Add more button */}
              {previews.length < maxImages && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center text-muted-foreground p-1",
                    "hover:border-primary/50 hover:text-primary/70 transition-colors"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Plus className="h-6 w-6 mb-1" />
                  <p className="text-xs font-medium">Add More</p>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      {previews.length === 0 && (
        <div 
          className={cn(
            "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground",
            "hover:border-primary/50 hover:text-primary/70 transition-colors cursor-pointer",
            "min-h-[200px]"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mb-4" />
          <p className="text-base font-medium">Drag & drop images here</p>
          <p className="text-sm mt-1">Upload up to {maxImages} items at once</p>
          <p className="text-xs mt-3 text-muted-foreground">Supported formats: JPG, PNG, WEBP</p>
        </div>
      )}
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="bulk-image-upload"
        multiple
      />
      
      {previews.length === 0 && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="h-10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = "environment";
                fileInputRef.current.click();
              }
            }}
            disabled={isLoading}
            className="h-10"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photos
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="text-center py-2">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          <p className="text-xs mt-1 text-muted-foreground">Processing images...</p>
        </div>
      )}
    </div>
  );
}