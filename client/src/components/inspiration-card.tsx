import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ExternalLink, Heart, Share2, BookmarkPlus } from "lucide-react";
import { Inspiration } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface InspirationCardProps {
  inspiration: Inspiration;
  onSave: () => void;
  onShare: () => void;
}

export default function InspirationCard({ inspiration, onSave, onShare }: InspirationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden h-full transform transition-shadow duration-300 hover:shadow-lg cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0">
                <Skeleton className="w-full h-full" />
              </div>
            )}
            <motion.img 
              src={inspiration.imageUrl} 
              alt={inspiration.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <BookmarkPlus className="h-4 w-4 text-black" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
              >
                <Share2 className="h-4 w-4 text-black" />
              </Button>
            </motion.div>
          </motion.div>

          {inspiration.source && (
            <Badge className="absolute top-2 right-2 bg-black/60 hover:bg-black/80">
              {inspiration.source}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-1 line-clamp-1">{inspiration.title}</h3>
          {inspiration.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {inspiration.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {inspiration.tags?.map((tag, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="outline" className="text-xs">
                  {tag}
                </Badge>
              </motion.div>
            ))}

            {inspiration.category && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="secondary" className="text-xs">
                  {inspiration.category}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}