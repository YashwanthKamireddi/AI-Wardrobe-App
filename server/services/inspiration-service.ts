import axios from 'axios';
import { Inspiration } from '@shared/schema';
import { storage } from '../storage';

const PEXELS_API_ENDPOINT = 'https://api.pexels.com/v1';
const FASHION_QUERIES = [
  'fashion style outfit',
  'street fashion',
  'fashion trends',
  'casual outfit',
  'formal wear',
  'fashion accessories',
  'fashion inspiration'
];

export async function fetchLatestInspirations(): Promise<Inspiration[]> {
  const inspirations: Inspiration[] = [];

  try {
    // Randomly select 2 queries to mix up the content
    const selectedQueries = FASHION_QUERIES.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const query of selectedQueries) {
      const response = await axios.get(`${PEXELS_API_ENDPOINT}/search`, {
        params: {
          query,
          per_page: 15,
          orientation: 'portrait'
        },
        headers: {
          'Authorization': process.env.PEXELS_API_KEY
        }
      });

      const photos = response.data.photos;

      photos.forEach((photo: any) => {
        inspirations.push({
          title: photo.alt || 'Fashion Inspiration',
          description: `Style inspiration by ${photo.photographer}`,
          imageUrl: photo.src.large,
          source: 'Pexels',
          category: query.split(' ')[0],
          tags: generateTags(query, photo.alt),
          favorite: false
        });
      });
    }

    // Store new inspirations in the database
    for (const inspiration of inspirations) {
      await storage.createInspiration(inspiration);
    }

    console.log(`Fetched ${inspirations.length} new inspirations`);
    return inspirations;
  } catch (error) {
    console.error('Error fetching fashion inspirations:', error);
    throw new Error('Failed to fetch fashion inspirations');
  }
}

function generateTags(query: string, alt: string | null): string[] {
  const tags = new Set<string>();

  // Add query terms as tags
  query.split(' ').forEach(term => tags.add(term));

  // Add description terms as tags if available
  if (alt) {
    alt.toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .forEach(word => tags.add(word));
  }

  // Common fashion tags
  const commonTags = ['trendy', 'stylish', 'fashion', 'outfit'];
  commonTags.forEach(tag => tags.add(tag));

  return Array.from(tags).slice(0, 5); // Limit to 5 tags
}

// Refresh interval: 6 hours
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

export function startInspirationRefresh() {
  // Initial fetch
  fetchLatestInspirations().catch(console.error);

  // Set up periodic refresh
  setInterval(async () => {
    try {
      await fetchLatestInspirations();
    } catch (error) {
      console.error('Error refreshing inspirations:', error);
    }
  }, REFRESH_INTERVAL);
}

function extractImageFromContent(content?: string): string {
  if (!content) return '';
  // Simple regex to extract first image URL from content
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : '';
}