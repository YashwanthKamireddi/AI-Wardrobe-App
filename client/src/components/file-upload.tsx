import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";

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
        <div className="relative rounded-md overflow-hidden border border-amber-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none"></div>
          <img 
            src={preview} 
            alt="Uploaded preview" 
            className="w-full h-full object-cover aspect-square"
          />
          <div
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-white/90 border border-amber-300 rounded-full hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <X className="h-4 w-4 text-amber-700" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-900/50 to-transparent"></div>
        </div>
      ) : (
        <div className="border-2 border-amber-200/50 border-dashed rounded-md aspect-square flex flex-col items-center justify-center p-4 bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
          <div className="rounded-full bg-amber-100 p-4 mb-4">
            <ImageIcon className="h-10 w-10 text-amber-500" />
          </div>
          <p className="text-sm font-luxury-body uppercase tracking-wide text-amber-900">Drag & drop image</p>
          <p className="text-xs font-luxury-body mt-1 text-amber-700">or select from options below</p>
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
            className="border-amber-300 text-amber-900 hover:bg-amber-50 hover:text-amber-950 font-luxury-body"
          >
            <Upload className="h-4 w-4 mr-2 text-amber-500" />
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
            className="border-amber-300 text-amber-900 hover:bg-amber-50 hover:text-amber-950 font-luxury-body"
          >
            <Camera className="h-4 w-4 mr-2 text-amber-500" />
            Take Photo
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 my-2">
          <div className="h-px flex-1 bg-amber-200/50"></div>
          <span className="text-xs text-amber-700 font-luxury-body">OR</span>
          <div className="h-px flex-1 bg-amber-200/50"></div>
        </div>
        
        <Input
          type="url"
          placeholder="Enter image URL"
          onChange={handleUrlInput}
          disabled={isLoading}
          className="input-luxury font-luxury-body"
        />
        
        {isLoading && (
          <div className="text-center py-3">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-amber-400 border-r-transparent"></div>
            <p className="text-xs mt-2 font-luxury-body text-amber-700">Processing image...</p>
          </div>
        )}
      </div>
    </div>
  );
}
