import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherError {
  error: string;
  message: string;
}

export function useWeather(customLocation?: string) {
  // Build query string with location parameter if provided
  const queryString = customLocation ? `?location=${encodeURIComponent(customLocation)}` : "";

  return useQuery<WeatherData, Error>({
    queryKey: ["/api/weather", customLocation], // Include location in the query key for proper caching
    queryFn: async () => {
      const response = await fetch(`/api/weather${queryString}`);
      const data = await response.json();

      // Check if the response has an error property
      if (response.status !== 200 || data.error) {
        throw new Error(data.message || 'Weather data fetch failed');
      }

      return data;
    },
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
    retry: 1, // Only retry once for invalid locations
  });
}

// Helper function to determine appropriate clothing based on weather
export function getWeatherBasedRecommendations(weather: WeatherData | undefined) {
  if (!weather) return {
    condition: "unknown",
    recommendation: "Wait for weather data to load",
    clothingTypes: ["tops", "bottoms", "outerwear"]
  };

  const { temperature, condition } = weather;
  let recommendation = "";
  let clothingTypes = ["tops", "bottoms"];

  // Temperature-based recommendations
  if (temperature < 5) {
    recommendation = "It's very cold! Bundle up with warm layers.";
    clothingTypes = [...clothingTypes, "outerwear"];
  } else if (temperature < 15) {
    recommendation = "It's chilly. A jacket or sweater would be good.";
    clothingTypes = [...clothingTypes, "outerwear"];
  } else if (temperature < 25) {
    recommendation = "It's mild. Light layers are perfect.";
  } else {
    recommendation = "It's warm! Light, breathable clothing is best.";
  }

  // Condition-based additions
  if (condition.toLowerCase().includes("rain")) {
    recommendation += " Don't forget rain protection!";
    clothingTypes.push("outerwear");
  } else if (condition.toLowerCase().includes("snow")) {
    recommendation += " Snow boots and a warm coat are essential.";
    clothingTypes.push("outerwear", "shoes");
  } else if (condition.toLowerCase().includes("wind")) {
    recommendation += " It's windy, so secure items are recommended.";
  } else if (condition.toLowerCase().includes("sun")) {
    recommendation += " It's sunny! Consider a hat and sunglasses.";
    clothingTypes.push("accessories");
  }

  return {
    condition: condition.toLowerCase(),
    recommendation,
    clothingTypes
  };
}