import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Heart, Cloud, ThumbsUp, Save } from "lucide-react";
import { WardrobeItem } from "@shared/schema";

interface WeatherData {
  location?: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  icon?: string;
}

interface OutfitRecommendationProps {
  items: WardrobeItem[];
  weather?: WeatherData;
  mood: string;
}

export default function OutfitRecommendation({ items, weather, mood }: OutfitRecommendationProps) {
  // Organize items by category for display
  const categories = {
    tops: items.filter(item => item.category === "tops"),
    bottoms: items.filter(item => item.category === "bottoms"),
    dresses: items.filter(item => item.category === "dresses"),
    outerwear: items.filter(item => item.category === "outerwear"),
    shoes: items.filter(item => item.category === "shoes"),
    accessories: items.filter(item => item.category === "accessories"),
    makeup: items.filter(item => item.category === "makeup")
  };
  
  // Get label for mood
  const getMoodLabel = (moodValue: string): string => {
    switch (moodValue) {
      case "happy": return "Happy";
      case "confident": return "Confident";
      case "relaxed": return "Relaxed";
      case "energetic": return "Energetic";
      case "romantic": return "Romantic";
      case "professional": return "Professional";
      case "creative": return "Creative";
      default: return moodValue;
    }
  };
  
  // No items in the wardrobe
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Add items to your wardrobe to get outfit recommendations!
        </p>
        <Button asChild>
          <a href="/wardrobe">Manage Wardrobe</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {weather && (
          <Badge variant="outline" className="text-xs backdrop-blur-sm bg-background/50 shadow-sm">
            <Cloud className="h-3 w-3 mr-1 text-primary" />
            {weather.condition || "Weather-based"}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs backdrop-blur-sm bg-background/50 shadow-sm">
          <ThumbsUp className="h-3 w-3 mr-1 text-primary" />
          {getMoodLabel(mood)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
        {/* Main clothing items */}
        {(categories.dresses.length > 0 || (categories.tops.length > 0 && categories.bottoms.length > 0)) && (
          <Card className="col-span-1 md:col-span-2 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {categories.dresses.length > 0 ? (
                  <div className="relative aspect-square md:aspect-auto md:h-full">
                    <img 
                      src={categories.dresses[0].imageUrl} 
                      alt={categories.dresses[0].name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                      <h3 className="font-medium text-sm">{categories.dresses[0].name}</h3>
                      <p className="text-xs opacity-90">{categories.dresses[0].category}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {categories.tops.length > 0 && (
                      <div className="relative aspect-square md:aspect-auto md:h-full">
                        <img 
                          src={categories.tops[0].imageUrl} 
                          alt={categories.tops[0].name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                          <h3 className="font-medium text-sm">{categories.tops[0].name}</h3>
                          <p className="text-xs opacity-90">{categories.tops[0].category}</p>
                        </div>
                      </div>
                    )}
                    
                    {categories.bottoms.length > 0 && (
                      <div className="relative aspect-square md:aspect-auto md:h-full">
                        <img 
                          src={categories.bottoms[0].imageUrl} 
                          alt={categories.bottoms[0].name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                          <h3 className="font-medium text-sm">{categories.bottoms[0].name}</h3>
                          <p className="text-xs opacity-90">{categories.bottoms[0].category}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Outerwear, shoes, accessories grid */}
        <Card className="col-span-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-px bg-muted">
              {categories.outerwear.length > 0 && (
                <div className="relative aspect-square">
                  <img 
                    src={categories.outerwear[0].imageUrl} 
                    alt={categories.outerwear[0].name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2 text-white">
                    <p className="text-xs">{categories.outerwear[0].name}</p>
                  </div>
                </div>
              )}
              
              {categories.shoes.length > 0 && (
                <div className="relative aspect-square">
                  <img 
                    src={categories.shoes[0].imageUrl} 
                    alt={categories.shoes[0].name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2 text-white">
                    <p className="text-xs">{categories.shoes[0].name}</p>
                  </div>
                </div>
              )}
              
              {categories.accessories.slice(0, 2).map((accessory, index) => (
                <div key={index} className="relative aspect-square">
                  <img 
                    src={accessory.imageUrl} 
                    alt={accessory.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2 text-white">
                    <p className="text-xs">{accessory.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Placeholder for empty slots */}
              {[...categories.outerwear, ...categories.shoes, ...categories.accessories.slice(0, 2)].length < 4 && (
                Array(4 - [...categories.outerwear, ...categories.shoes, ...categories.accessories.slice(0, 2)].length).fill(0).map((_, index) => (
                  <div key={index} className="aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                    <p className="text-xs">No item</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Makeup recommendations */}
      {categories.makeup.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Recommended Makeup</h3>
          <div className="flex flex-wrap gap-2">
            {categories.makeup.map((item, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                <Check className="h-3 w-3 mr-2" /> {item.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" size="sm">
          <Heart className="h-4 w-4 mr-2" /> Like
        </Button>
        
        <Button variant="default" size="sm">
          <Save className="h-4 w-4 mr-2" /> Save Outfit
        </Button>
      </div>
    </div>
  );
}
