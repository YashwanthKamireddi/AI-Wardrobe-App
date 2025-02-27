import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWeather, getWeatherBasedRecommendations } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import NavigationBar from "@/components/navigation-bar";
import WeatherDisplay from "@/components/weather-display";
import MoodSelector from "@/components/mood-selector";
import OutfitRecommendation from "@/components/outfit-recommendation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCcw } from "lucide-react";
import { WardrobeItem, moodTypes } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useState("New York City");
  const [locationInput, setLocationInput] = useState("New York City");
  const { data: weather, isLoading: weatherLoading } = useWeather(location);
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const [selectedMood, setSelectedMood] = useState(moodTypes[0].value);
  const [recommendedOutfit, setRecommendedOutfit] = useState<WardrobeItem[]>([]);

  const weatherRecommendations = getWeatherBasedRecommendations(weather);

  // Function to handle location update
  const handleLocationUpdate = () => {
    setLocation(locationInput);
  };

  // Function to generate outfit recommendation based on weather and mood
  const generateOutfitRecommendation = (): WardrobeItem[] => {
    if (!wardrobeItems || wardrobeItems.length === 0 || !weatherRecommendations) {
      return [];
    }

    // Filter items by the recommended clothing types from weather
    const weatherAppropriateItems = wardrobeItems.filter(item => 
      weatherRecommendations.clothingTypes.includes(item.category)
    );

    // If we don't have enough weather-appropriate items, fall back to all items
    const itemPool = weatherAppropriateItems.length > 3 ? weatherAppropriateItems : wardrobeItems;

    // For a real application, this would be a more sophisticated algorithm
    // considering color coordination, style matching, item pairing preferences, etc.
    const recommendedItems: WardrobeItem[] = [];

    // Try to get one item from each essential category
    const categories = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

    for (const category of categories) {
      const categoryItems = itemPool.filter(item => item.category === category);

      if (categoryItems.length > 0) {
        // For now, just pick a random item from each category
        const randomIndex = Math.floor(Math.random() * categoryItems.length);
        recommendedItems.push(categoryItems[randomIndex]);
      }
    }

    return recommendedItems;
  };

  // Regenerate outfit when weather or mood changes
  useEffect(() => {
    if (!weatherLoading && weather) {
      const newOutfit = generateOutfitRecommendation();
      setRecommendedOutfit(newOutfit);
    }
  }, [weather, selectedMood, wardrobeItems]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Cher's Closet, {user?.name || user?.username}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weather Card */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Weather</CardTitle>
              <CardDescription>
                Dress appropriately for the conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Location selector */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter location"
                    className="pl-8"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLocationUpdate()}
                  />
                </div>
                <Button 
                  size="sm" 
                  onClick={handleLocationUpdate}
                  variant="outline"
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>

              {weatherLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-3/4" />
                </div>
              ) : (
                <WeatherDisplay weather={weather!} recommendations={weatherRecommendations} />
              )}
            </CardContent>
          </Card>

          {/* Mood Card */}
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
              <CardDescription>
                Select your mood for personalized outfit recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MoodSelector 
                selectedMood={selectedMood} 
                setSelectedMood={setSelectedMood} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Outfit Recommendation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Outfit Recommendation</CardTitle>
            <CardDescription>
              Based on today's weather and your mood
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wardrobeLoading || weatherLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : wardrobeItems && wardrobeItems.length > 0 ? (
              <OutfitRecommendation 
                items={recommendedOutfit} 
                weather={weather}
                mood={selectedMood}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">
                  You haven't added any items to your wardrobe yet.
                </p>
                <a 
                  href="/wardrobe" 
                  className="text-primary font-medium hover:underline"
                >
                  Start building your wardrobe
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                <path d="M9 14v2" />
                <path d="M15 14v2" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Manage Wardrobe</h3>
              <p className="text-sm text-muted-foreground">
                Add, organize, and update your clothing items
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Create Outfits</h3>
              <p className="text-sm text-muted-foreground">
                Design and save your favorite outfit combinations
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Get Inspiration</h3>
              <p className="text-sm text-muted-foreground">
                Browse trending styles and fashion ideas
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}