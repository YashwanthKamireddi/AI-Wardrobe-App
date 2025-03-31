import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentImageUrl?: string;
}

export default function FileUpload({ onUpload, currentImageUrl }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For a real implementation, this would upload to a server
  // For this demo, we'll simulate an upload and use base64 encoding
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate a network delay
      setTimeout(() => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(result);
        setIsLoading(false);
      }, 800);
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
  
  // For demo purposes - using a URL directly
  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value.trim();
    if (url) {
      setPreview(url);
      onUpload(url);
    }
  };
  
  return (
    <div className="space-y-5">
      {preview ? (
        <div className="relative rounded-sm overflow-hidden border border-accent/20 shadow-md boutique-item">
          <img 
            src={preview} 
            alt="Uploaded preview" 
            className="w-full h-full object-cover"
          />
          <div
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-black/60 border border-accent/40 rounded-sm hover:bg-black/80 transition-colors cursor-pointer animate-fade-in"
          >
            <X className="h-4 w-4 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
      ) : (
        <div className="border border-accent/20 border-dashed rounded-sm aspect-square flex flex-col items-center justify-center text-muted-foreground p-4 bg-background/50 hover:bg-background/80 transition-colors">
          <Upload className="h-10 w-10 mb-3 text-accent/70" />
          <p className="text-sm font-fashion-body uppercase tracking-wide">Drag & drop image</p>
          <p className="text-xs font-fashion-body mt-1">or select upload option below</p>
        </div>
      )}
      
      <div className="grid gap-3">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="fashion-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // For demo purposes, we'll just open the device camera
              if (fileInputRef.current) {
                fileInputRef.current.capture = "environment";
                fileInputRef.current.click();
              }
            }}
            disabled={isLoading}
            className="fashion-button"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 my-1">
          <div className="h-px flex-1 bg-accent/10"></div>
          <span className="text-xs text-muted-foreground font-fashion-body">OR</span>
          <div className="h-px flex-1 bg-accent/10"></div>
        </div>
        
        <Input
          type="url"
          placeholder="Enter image URL"
          onChange={handleUrlInput}
          disabled={isLoading}
          className="input-enhanced font-fashion-body"
        />
        
        {isLoading && (
          <div className="text-center py-3">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-accent border-r-transparent"></div>
            <p className="text-xs mt-2 font-fashion-body text-muted-foreground">Processing image...</p>
          </div>
        )}
      </div>
    </div>
  );
}
