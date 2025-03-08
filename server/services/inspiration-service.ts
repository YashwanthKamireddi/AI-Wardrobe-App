import axios from 'axios';
import { Inspiration } from '@shared/schema';
import { storage } from '../storage';

const PEXELS_API_ENDPOINT = 'https://api.pexels.com/v1';
const FASHION_QUERIES = [
  'street style fashion',
  'casual outfit ideas',
  'formal fashion',
  'trendy outfits',
  'summer fashion',
  'winter fashion',
  'modern fashion',
  'minimal style',
  'vintage fashion',
  'contemporary fashion',
  'business casual',
  'bohemian style',
  'athleisure fashion',
  'evening wear',
  'urban fashion',
  'spring outfits',
  'fall fashion',
  'luxury fashion',
  'minimalist style',
  'fashion accessories'
];

async function cleanupOldInspirations() {
  try {
    await storage.deleteAllInspirations();
    console.log('Cleaned up old inspirations');
  } catch (error) {
    console.error('Error cleaning up old inspirations:', error);
  }
}

export async function fetchLatestInspirations(): Promise<Inspiration[]> {
  const inspirations: Inspiration[] = [];

  try {
    // Select 6 random queries to get diverse content
    const selectedQueries = FASHION_QUERIES
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    console.log('Fetching inspirations with queries:', selectedQueries);

    for (const query of selectedQueries) {
      const response = await axios.get(`${PEXELS_API_ENDPOINT}/search`, {
        params: {
          query,
          per_page: 15,
          orientation: 'portrait',
          size: 'large'
        },
        headers: {
          'Authorization': process.env.PEXELS_API_KEY
        }
      });

      const photos = response.data.photos;
      console.log(`Fetched ${photos.length} photos for query: ${query}`);

      photos.forEach((photo: any) => {
        const tags = generateTags(query, photo.alt);
        inspirations.push({
          title: generateTitle(query, photo.alt),
          description: `Style inspiration by ${photo.photographer}. ${generateDescription(query, tags)}`,
          imageUrl: photo.src.large2x || photo.src.large,
          source: 'Pexels',
          category: determineCategory(query),
          tags
        });
      });
    }

    // Store new inspirations in the database
    const savedInspirations = await Promise.all(
      inspirations.map(inspiration => storage.createInspiration(inspiration))
    );

    console.log(`Successfully saved ${savedInspirations.length} new inspirations`);
    return savedInspirations;

  } catch (error) {
    console.error('Error fetching fashion inspirations:', error);
    throw new Error('Failed to fetch fashion inspirations');
  }
}

function determineCategory(query: string): string {
  const categories = {
    casual: ['street style', 'casual', 'athleisure', 'minimal', 'urban'],
    formal: ['formal', 'business', 'evening wear', 'luxury'],
    seasonal: ['summer', 'winter', 'spring', 'fall'],
    vintage: ['vintage', 'bohemian', 'retro'],
    trending: ['trendy', 'contemporary', 'modern'],
    accessories: ['accessories']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

function generateTitle(query: string, alt: string | null): string {
  const baseTitle = alt || query;
  const titles = [
    `${baseTitle} Look`,
    `Trending: ${baseTitle}`,
    `Style Inspiration: ${baseTitle}`,
    `Fashion Focus: ${baseTitle}`,
    `Today's Pick: ${baseTitle}`,
    `Must-Try: ${baseTitle}`,
    `Style Guide: ${baseTitle}`,
    `Fashion Edit: ${baseTitle}`
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateDescription(query: string, tags: string[]): string {
  const descriptions = [
    `Perfect for ${tags.slice(0, 2).join(' and ')} occasions.`,
    `Featuring the latest trends in ${query}.`,
    `A stunning combination of ${tags.slice(0, 2).join(' and ')}.`,
    `Elevate your style with this ${query} inspiration.`,
    `Discover the perfect blend of ${tags.slice(0, 2).join(' and ')}.`,
    `Make a statement with this ${query} ensemble.`,
    `Stand out with this curated ${tags[0]} look.`,
    `The perfect choice for your next ${tags[0]} occasion.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateTags(query: string, alt: string | null): string[] {
  const tags = new Set<string>();

  // Add query terms as tags
  query.split(' ')
    .filter(term => term.length > 3)
    .forEach(term => tags.add(term.toLowerCase()));

  // Add description terms as tags if available
  if (alt) {
    alt.toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .forEach(word => tags.add(word));
  }

  // Add style tags
  const styles = [
    'casual', 'formal', 'streetwear', 'vintage', 'modern', 
    'minimalist', 'trendy', 'elegant', 'chic', 'bohemian', 
    'classic', 'contemporary', 'luxurious', 'urban'
  ];

  // Add 2-3 random style tags
  styles
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2)
    .forEach(style => tags.add(style));

  // Add occasion tags
  const occasions = [
    'everyday', 'work', 'party', 'weekend', 'special',
    'casual', 'formal', 'outdoor', 'travel', 'date'
  ];

  // Add 1-2 random occasion tags
  occasions
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 1)
    .forEach(occasion => tags.add(occasion));

  return Array.from(tags).slice(0, 7); // Allow more tags
}

// Refresh interval: 30 minutes
const REFRESH_INTERVAL = 30 * 60 * 1000;

export function startInspirationRefresh() {
  console.log('Starting inspiration refresh service');

  // Initial fetch
  fetchLatestInspirations().catch(console.error);

  // Set up periodic refresh
  setInterval(async () => {
    console.log('Running scheduled inspiration refresh');
    try {
      await cleanupOldInspirations();
      await fetchLatestInspirations();
      console.log('Completed scheduled inspiration refresh');
    } catch (error) {
      console.error('Error during scheduled inspiration refresh:', error);
    }
  }, REFRESH_INTERVAL);
}