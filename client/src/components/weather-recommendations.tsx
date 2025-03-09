
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AnimatedCard } from './ui/animated-card';

type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
};

type RecommendationItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  priority: number;
};

interface WeatherRecommendationsProps {
  weatherData: WeatherData | null;
}

export const WeatherRecommendations: React.FC<WeatherRecommendationsProps> = ({ weatherData }) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!weatherData) return;
    
    setIsLoading(true);
    
    // This would be replaced with an actual API call in production
    setTimeout(() => {
      // Generate recommendations based on weather conditions
      const newRecommendations: RecommendationItem[] = [];
      
      // Temperature-based recommendations
      if (weatherData.temperature < 5) {
        // Cold weather items
        newRecommendations.push(
          {
            id: 'item1',
            name: 'Insulated Winter Coat',
            description: 'Stay warm in freezing temperatures',
            image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Outerwear',
            priority: 1
          },
          {
            id: 'item2',
            name: 'Thermal Base Layer',
            description: 'Essential first layer for cold days',
            image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Tops',
            priority: 2
          },
          {
            id: 'item3',
            name: 'Winter Boots',
            description: 'Waterproof and insulated footwear',
            image: 'https://images.unsplash.com/photo-1546367791-e7447b431084?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Footwear',
            priority: 1
          }
        );
      } else if (weatherData.temperature < 15) {
        // Cool weather items
        newRecommendations.push(
          {
            id: 'item4',
            name: 'Light Jacket or Cardigan',
            description: 'Perfect for layering in cool weather',
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Outerwear',
            priority: 1
          },
          {
            id: 'item5',
            name: 'Long Sleeve Top',
            description: 'Comfortable coverage for cool days',
            image: 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Tops',
            priority: 2
          }
        );
      } else if (weatherData.temperature < 25) {
        // Mild weather items
        newRecommendations.push(
          {
            id: 'item6',
            name: 'Lightweight Layers',
            description: 'Adaptable options for changing temperatures',
            image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Tops',
            priority: 1
          }
        );
      } else {
        // Hot weather items
        newRecommendations.push(
          {
            id: 'item7',
            name: 'Breathable T-Shirt',
            description: 'Stay cool in high temperatures',
            image: 'https://images.unsplash.com/photo-1526476148966-98bd039463ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Tops',
            priority: 1
          },
          {
            id: 'item8',
            name: 'Shorts or Light Pants',
            description: 'Comfortable bottoms for hot days',
            image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Bottoms',
            priority: 1
          }
        );
      }
      
      // Condition-based recommendations
      if (weatherData.condition.toLowerCase().includes('rain') || 
          weatherData.condition.toLowerCase().includes('drizzle')) {
        newRecommendations.push(
          {
            id: 'item9',
            name: 'Waterproof Jacket',
            description: 'Stay dry in rainy conditions',
            image: 'https://images.unsplash.com/photo-1605908502724-9093a79a1b39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Outerwear',
            priority: 1
          },
          {
            id: 'item10',
            name: 'Water-Resistant Footwear',
            description: 'Keep feet dry in wet weather',
            image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Footwear',
            priority: 1
          }
        );
      } else if (weatherData.condition.toLowerCase().includes('snow')) {
        newRecommendations.push(
          {
            id: 'item11',
            name: 'Snow Boots',
            description: 'Essential footwear for snowy conditions',
            image: 'https://images.unsplash.com/photo-1608322681777-eb1d7c7e5fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Footwear',
            priority: 1
          }
        );
      } else if (weatherData.condition.toLowerCase().includes('sunny') || 
                weatherData.condition.toLowerCase().includes('clear')) {
        if (weatherData.temperature > 20) {
          newRecommendations.push(
            {
              id: 'item12',
              name: 'Sun Hat',
              description: 'Protect yourself from UV rays',
              image: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
              category: 'Accessories',
              priority: 2
            },
            {
              id: 'item13',
              name: 'Sunglasses',
              description: 'Eye protection for bright days',
              image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
              category: 'Accessories',
              priority: 2
            }
          );
        }
      }
      
      // Wind-based recommendations
      if (weatherData.windSpeed > 20) {
        newRecommendations.push(
          {
            id: 'item14',
            name: 'Windbreaker',
            description: 'Protection from strong winds',
            image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500',
            category: 'Outerwear',
            priority: 2
          }
        );
      }
      
      // Sort by priority
      newRecommendations.sort((a, b) => a.priority - b.priority);
      
      setRecommendations(newRecommendations);
      setIsLoading(false);
    }, 1000);
  }, [weatherData]);

  if (!weatherData) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Today's Outfit Recommendations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on {weatherData.temperature}°C and {weatherData.condition} in {weatherData.location.split(' ')[0]}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-40 bg-muted rounded-full mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((item, index) => (
                <AnimatedCard 
                  key={item.id}
                  hoverEffect="lift"
                  transitionDelay={`${index * 100}ms`}
                  className="overflow-hidden h-full flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary/90">{item.category}</Badge>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-medium mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground flex-grow">{item.description}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
            
            {recommendations.length > 3 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Additional Recommendations:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {recommendations.slice(3).map(item => (
                    <div key={item.id} className="rounded bg-muted/50 p-2 text-sm">
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
