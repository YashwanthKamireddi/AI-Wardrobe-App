
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AnimatedCard } from './ui/animated-card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

type OutfitItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  color: string;
  brand?: string;
  style: string;
};

type GeneratedOutfit = {
  id: string;
  title: string;
  items: OutfitItem[];
  occasion: string;
  season: string;
  weatherType: string;
};

// Mock data for demonstration
const SAMPLE_OUTFITS: GeneratedOutfit[] = [
  {
    id: 'outfit1',
    title: 'Casual Spring Day',
    occasion: 'Casual',
    season: 'Spring',
    weatherType: 'Mild',
    items: [
      {
        id: 'item1',
        name: 'Light Denim Jacket',
        type: 'Outerwear',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'Blue',
        style: 'Casual'
      },
      {
        id: 'item2',
        name: 'White T-Shirt',
        type: 'Top',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'White',
        style: 'Basic'
      },
      {
        id: 'item3',
        name: 'Black Slim Jeans',
        type: 'Bottom',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'Black',
        style: 'Casual'
      },
      {
        id: 'item4',
        name: 'Canvas Sneakers',
        type: 'Footwear',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'White',
        style: 'Casual'
      }
    ]
  },
  {
    id: 'outfit2',
    title: 'Business Meeting',
    occasion: 'Business',
    season: 'All Seasons',
    weatherType: 'Indoor',
    items: [
      {
        id: 'item5',
        name: 'Navy Blazer',
        type: 'Outerwear',
        image: 'https://images.unsplash.com/photo-1598808503746-f34fabd977bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'Navy',
        style: 'Formal'
      },
      {
        id: 'item6',
        name: 'Light Blue Button-up',
        type: 'Top',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'Light Blue',
        style: 'Business'
      },
      {
        id: 'item7',
        name: 'Charcoal Dress Pants',
        type: 'Bottom',
        image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'Gray',
        style: 'Formal'
      },
      {
        id: 'item8',
        name: 'Oxford Dress Shoes',
        type: 'Footwear',
        image: 'https://images.unsplash.com/photo-1554062614-6da4fa67725a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
        color: 'Brown',
        style: 'Formal'
      }
    ]
  }
];

export const OutfitGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<GeneratedOutfit[]>([]);
  const [occasion, setOccasion] = useState("casual");
  const [season, setSeason] = useState("current");
  const [stylePreference, setStylePreference] = useState("balanced");
  const [colorfulness, setColorfulness] = useState([50]);
  
  const generateOutfits = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedOutfits(SAMPLE_OUTFITS);
      setIsLoading(false);
    }, 1500);
  };
  
  const saveOutfit = (outfitId: string) => {
    // Implementation would save to user's collection
    console.log(`Saving outfit ${outfitId} to collection`);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">AI Outfit Generator</CardTitle>
          <p className="text-muted-foreground">Create weather-appropriate looks based on your preferences</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferences">Set Preferences</TabsTrigger>
              <TabsTrigger value="results" disabled={generatedOutfits.length === 0}>View Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences" className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="occasion">Occasion</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="formal">Formal Event</SelectItem>
                      <SelectItem value="date">Date Night</SelectItem>
                      <SelectItem value="workout">Workout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="season">Season</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Weather</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="style">Style Preference</Label>
                  <Select value={stylePreference} onValueChange={setStylePreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic & Timeless</SelectItem>
                      <SelectItem value="trendy">Trendy & Current</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="statement">Statement & Bold</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="colorfulness">Color Palette</Label>
                    <span className="text-sm text-muted-foreground">{colorfulness[0]}%</span>
                  </div>
                  <Slider 
                    id="colorfulness"
                    min={0}
                    max={100}
                    step={10}
                    value={colorfulness}
                    onValueChange={setColorfulness}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Neutral</span>
                    <span>Colorful</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={generateOutfits} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating Outfits...' : 'Generate Outfits'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="results">
              <div className="space-y-6">
                {generatedOutfits.map(outfit => (
                  <AnimatedCard key={outfit.id} className="overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-1">{outfit.title}</h3>
                      <div className="flex gap-2 mb-4">
                        <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md">{outfit.occasion}</span>
                        <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md">{outfit.season}</span>
                        <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md">{outfit.weatherType}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {outfit.items.map(item => (
                          <div key={item.id} className="rounded-lg overflow-hidden border bg-card">
                            <div className="h-32 overflow-hidden">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2">
                              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => saveOutfit(outfit.id)}
                        >
                          Save to Collection
                        </Button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
