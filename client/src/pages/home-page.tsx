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
import { MapPin, RefreshCcw, AlertCircle, CloudSun, Sun, Cloud, Layers } from "lucide-react";
import { WardrobeItem, moodTypes } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation, Link } from "wouter"; 
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  const [weatherLocation, setWeatherLocation] = useState(() => 
    localStorage.getItem("weatherLocation") || "New York City"
  );
  const [locationInput, setLocationInput] = useState<string>(weatherLocation);
  const { data: weather, isLoading: weatherLoading, refetch, error: weatherError } = useWeather(weatherLocation);
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const [selectedMood, setSelectedMood] = useState(moodTypes[0].value);
  const [recommendedOutfit, setRecommendedOutfit] = useState<WardrobeItem[]>([]);
  const [_, setUrlLocation] = useLocation(); 

  const weatherRecommendations = getWeatherBasedRecommendations(weather);

  const handleLocationUpdate = (newLocation?: string) => {
    const locationToUse = newLocation || locationInput;
    localStorage.setItem("weatherLocation", locationToUse);
    setWeatherLocation(locationToUse);

    if (newLocation) {
      setLocationInput("");
      setTimeout(() => setLocationInput(newLocation), 10);
    }

    setTimeout(() => refetch(), 100);
  };

  const generateOutfitRecommendation = (): WardrobeItem[] => {
    if (!wardrobeItems || wardrobeItems.length === 0 || !weatherRecommendations) {
      return [];
    }

    const weatherAppropriateItems = wardrobeItems.filter(item =>
      weatherRecommendations.clothingTypes.includes(item.category)
    );

    const itemPool = weatherAppropriateItems.length > 3 ? weatherAppropriateItems : wardrobeItems;

    const recommendedItems: WardrobeItem[] = [];
    const categories = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

    for (const category of categories) {
      const categoryItems = itemPool.filter(item => item.category === category);

      if (categoryItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryItems.length);
        recommendedItems.push(categoryItems[randomIndex]);
      }
    }

    return recommendedItems;
  };

  useEffect(() => {
    if (weather) {
      console.log("Weather updated:", weather);
      const newOutfit = generateOutfitRecommendation();
      setRecommendedOutfit(newOutfit);
    }
  }, [weather, selectedMood, wardrobeItems]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
        >
          Welcome to Cher's Closet, {user?.name || user?.username}!
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-2 border-primary/20 shadow-lg transition-all duration-300 hover:shadow-primary/20 h-full">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <div className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <CloudSun className="mr-2 h-6 w-6 text-primary" />
                  </motion.div>
                  <CardTitle>Today's Weather</CardTitle>
                </div>
                <CardDescription>
                  Dress appropriately for the conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-3 mb-5">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
                    <Input
                      type="text"
                      placeholder="Enter city name (e.g., New York, London, Tokyo)"
                      className="pl-8 border-primary/30 focus:border-primary/60 rounded-md"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLocationUpdate()}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => handleLocationUpdate()}
                        className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 text-primary-foreground"
                      >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Update Weather
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 hover:bg-primary/10 text-primary"
                        onClick={() => navigator.geolocation && navigator.geolocation.getCurrentPosition(
                          position => {
                            const { latitude, longitude } = position.coords;
                            const cityName = "Current Location"; 
                            setLocationInput(cityName);
                            handleLocationUpdate(cityName);
                          },
                          error => {
                            console.error("Error getting location:", error);
                          }
                        )}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Use My Location
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {weatherLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-3/4 rounded-lg" />
                  </div>
                ) : weatherError ? (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      {weatherError.message || "Could not find weather for this location. Try a major city name."}
                    </AlertDescription>
                  </Alert>
                ) : weather ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <WeatherDisplay weather={weather} recommendations={weatherRecommendations} />
                  </motion.div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Unable to load weather data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-primary/20 shadow-lg transition-all duration-300 hover:shadow-primary/20 h-full">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <div className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
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
                      className="mr-2 h-6 w-6 text-primary"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                  </motion.div>
                  <CardTitle>How are you feeling today?</CardTitle>
                </div>
                <CardDescription>
                  Select your mood for personalized outfit recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <MoodSelector
                  selectedMood={selectedMood}
                  setSelectedMood={setSelectedMood}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-10 border-2 border-primary/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 1 }}
                >
                  <Layers className="mr-2 h-6 w-6 text-primary" />
                </motion.div>
                <CardTitle>Your Outfit Recommendation</CardTitle>
              </div>
              <CardDescription>
                Based on today's weather and your mood
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {wardrobeLoading || weatherLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              ) : weather && wardrobeItems && wardrobeItems.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <OutfitRecommendation
                    items={recommendedOutfit}
                    weather={weather}
                    mood={selectedMood}
                  />
                </motion.div>
              ) : weatherError ? (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-lg text-muted-foreground mb-4">
                    Enter a valid location to get weather-based outfit recommendations.
                  </p>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground mb-6">
                    You haven't added any items to your wardrobe yet.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90">
                      <Link href="/wardrobe">Manage Wardrobe</Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setUrlLocation("/wardrobe")}
          >
            <div className="p-6 flex flex-col items-center text-center group-hover:bg-primary/5">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
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
                  className="h-10 w-10 mb-4 text-primary group-hover:text-primary/90"
                >
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                  <path d="M9 14v2" />
                  <path d="M15 14v2" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-medium mb-1 group-hover:text-primary">Manage Wardrobe</h3>
              <p className="text-sm text-muted-foreground">
                Add, organize, and update your clothing items
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setUrlLocation("/outfits")}
          >
            <div className="p-6 flex flex-col items-center text-center group-hover:bg-primary/5">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
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
                  className="h-10 w-10 mb-4 text-primary group-hover:text-primary/90"
                >
                  <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                  <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-medium mb-1 group-hover:text-primary">Create Outfits</h3>
              <p className="text-sm text-muted-foreground">
                Design and save your favorite outfit combinations
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setUrlLocation("/inspirations")}
          >
            <div className="p-6 flex flex-col items-center text-center group-hover:bg-primary/5">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
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
                  className="h-10 w-10 mb-4 text-primary group-hover:text-primary/90"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-medium mb-1 group-hover:text-primary">Get Inspiration</h3>
              <p className="text-sm text-muted-foreground">
                Browse trending styles and fashion ideas
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setUrlLocation("/profile")}
          >
            <div className="p-6 flex flex-col items-center text-center group-hover:bg-primary/5">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
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
                  className="h-10 w-10 mb-4 text-primary group-hover:text-primary/90"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-medium mb-1 group-hover:text-primary">Profile & Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}