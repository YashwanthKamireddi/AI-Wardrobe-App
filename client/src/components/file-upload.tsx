import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentImageUrl?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export default function FileUpload({ onUpload, currentImageUrl }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const errorMsg = "Please upload a valid image file (JPEG, PNG, WebP, or GIF)";
      setError(errorMsg);
      toast({
        title: "Invalid file type",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      setError(errorMsg);
      toast({
        title: "File too large",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = () => {
      setTimeout(() => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(result);
        setIsLoading(false);
      }, 800);
    };
    
    reader.onerror = () => {
      const errorMsg = "Failed to read file. Please try again.";
      setError(errorMsg);
      setIsLoading(false);
      toast({
        title: "Upload error",
        description: errorMsg,
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value.trim();
    if (url) {
      setError(null);
      
      // Basic URL validation
      try {
        new URL(url);
        setPreview(url);
        onUpload(url);
      } catch (e) {
        const errorMsg = "Please enter a valid URL";
        setError(errorMsg);
        toast({
          title: "Invalid URL",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-amber-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none"></div>
          <img 
            src={preview} 
            alt="Uploaded preview" 
            className="w-full object-cover aspect-square"
          />
          <div
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 p-1 bg-white/90 border border-amber-300 rounded-full hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <X className="h-3 w-3 text-amber-700" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-900/50 to-transparent"></div>
        </div>
      ) : (
        <div className="border-2 border-amber-200/50 border-dashed rounded-md aspect-square flex flex-col items-center justify-center p-3 bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
          <div className="rounded-full bg-amber-100 p-2 mb-2">
            <ImageIcon className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-xs font-luxury-body uppercase tracking-wide text-amber-900">Upload image</p>
          <p className="text-[10px] font-luxury-body text-amber-700">select from options below</p>
        </div>
      )}
      
      <div className="grid gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            disabled={isLoading}
            className="w-full text-xs h-7 border-amber-300 text-amber-900 hover:bg-amber-50 hover:text-amber-950 font-luxury-body"
          >
            <Upload className="h-3 w-3 mr-1.5 text-amber-500" />
            <span>Choose File</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 my-1">
          <div className="h-px flex-1 bg-amber-200/50"></div>
          <span className="text-[10px] text-amber-700 font-luxury-body">OR</span>
          <div className="h-px flex-1 bg-amber-200/50"></div>
        </div>
        
        <Input
          type="url"
          placeholder="Enter image URL"
          onChange={handleUrlInput}
          disabled={isLoading}
          className="input-luxury h-7 text-xs font-luxury-body"
        />
        
        {isLoading && (
          <div className="text-center py-1">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-amber-400 border-r-transparent"></div>
            <p className="text-[10px] mt-1 font-luxury-body text-amber-700">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
