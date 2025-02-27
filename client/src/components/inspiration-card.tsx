import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ThumbsUp, BookmarkPlus } from "lucide-react";
import { Inspiration } from "@shared/schema";

interface InspirationCardProps {
  inspiration: Inspiration;
}

export default function InspirationCard({ inspiration }: InspirationCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img 
            src={inspiration.imageUrl} 
            alt={inspiration.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {inspiration.source && (
          <Badge className="absolute top-2 right-2 bg-black/60 hover:bg-black/80">
            {inspiration.source}
          </Badge>
        )}
      </div>
      
      <CardContent className="py-4 flex-grow">
        <h3 className="text-lg font-medium mb-1">{inspiration.title}</h3>
        
        {inspiration.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {inspiration.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          {inspiration.tags && inspiration.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          
          {inspiration.category && (
            <Badge variant="secondary" className="text-xs">
              {inspiration.category}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Like
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ExternalLink className="h-4 w-4 mr-2" />
            Source
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
