import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Camera, Link, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({
  value,
  onChange,
  accept = "image/*",
  maxSize = MAX_FILE_SIZE
}: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({
        title: "Upload failed",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert to base64 for demo (in production, upload to storage)
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange(result);
        setIsLoading(false);
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read file");
        toast({
          title: "Upload failed",
          description: "Could not read the file. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed");
      setIsLoading(false);
    }
  }, [onChange, maxSize, toast]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }, [processFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      // Basic URL validation
      try {
        new URL(urlInput.trim());
        onChange(urlInput.trim());
        setUrlInput("");
        setShowUrlInput(false);
        setError(null);
      } catch {
        setError("Please enter a valid URL");
        toast({
          title: "Invalid URL",
          description: "Please enter a valid image URL",
          variant: "destructive",
        });
      }
    }
  };

  const handleClear = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (value) {
    return (
      <div className="relative rounded-md overflow-hidden border">
        <img
          src={value}
          alt="Uploaded"
          className="w-full aspect-square object-cover"
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-2 right-2 p-1.5 bg-background/90 border rounded-full hover:bg-background transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        aria-label="Upload image file"
      />

      {/* Upload area with drag and drop */}
      <label
        htmlFor="file-upload"
        className={`border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : error
              ? 'border-destructive/50 bg-destructive/5'
              : 'hover:bg-muted/50 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
          </>
        ) : (
          <>
            <div className={`rounded-full p-3 mb-3 ${error ? 'bg-destructive/10' : 'bg-muted'}`}>
              {error ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop image here' : 'Upload image'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP, GIF (max {(maxSize / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </>
        )}
      </label>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Browse
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={isLoading}
        >
          <Link className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <Button type="button" size="sm" onClick={handleUrlSubmit}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
