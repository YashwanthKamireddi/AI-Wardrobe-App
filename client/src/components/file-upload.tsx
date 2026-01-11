import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Camera, Link } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ value, onChange, accept = "image/*" }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Convert to base64 for demo (in production, upload to storage)
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange(result);
        setIsLoading(false);
      };
      reader.onerror = () => {
        console.error("Failed to read file");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsLoading(false);
    }
  }, [onChange]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleClear = () => {
    onChange("");
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
      />

      {/* Upload area */}
      <label
        htmlFor="file-upload"
        className="border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-muted p-3 mb-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Upload image</p>
            <p className="text-xs text-muted-foreground">Click to browse</p>
          </>
        )}
      </label>

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
