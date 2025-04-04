/**
 * Demo User Creation Script
 * 
 * This script creates a demonstration user with a complete men's wardrobe
 * and several pre-configured outfits for showcasing the application.
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const { Pool } = pg;

// Use database configuration from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createDemoUser() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create demo user
    const hashedPassword = await bcrypt.hash('demopassword', 10);
    const userResult = await client.query(
      `INSERT INTO users (username, password, name, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['demouser', hashedPassword, 'Alex Morgan', 'demo@example.com']
    );
    
    const userId = userResult.rows[0].id;
    console.log(`Created demo user with ID: ${userId}`);
    
    // 2. Add men's wardrobe items

    // Tops
    const tops = [
      {
        name: 'White Oxford Shirt',
        category: 'tops',
        subcategory: 'shirt',
        color: 'white',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg',
        tags: ['classic', 'formal', 'business'],
        favorite: true
      },
      {
        name: 'Navy Blue Polo',
        category: 'tops',
        subcategory: 'shirt',
        color: 'navy',
        season: 'spring,summer',
        imageUrl: 'https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg',
        tags: ['casual', 'smart casual'],
        favorite: false
      },
      {
        name: 'Grey Crewneck T-shirt',
        category: 'tops',
        subcategory: 't-shirt',
        color: 'grey',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg',
        tags: ['casual', 'layering', 'everyday'],
        favorite: true
      },
      {
        name: 'Black Turtleneck Sweater',
        category: 'tops',
        subcategory: 'sweater',
        color: 'black',
        season: 'fall,winter',
        imageUrl: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg',
        tags: ['smart casual', 'elegant', 'fall'],
        favorite: true
      },
      {
        name: 'Blue Denim Shirt',
        category: 'tops',
        subcategory: 'shirt',
        color: 'blue',
        season: 'spring,summer,fall',
        imageUrl: 'https://images.pexels.com/photos/1639729/pexels-photo-1639729.jpeg',
        tags: ['casual', 'rugged', 'layering'],
        favorite: false
      }
    ];

    // Bottoms
    const bottoms = [
      {
        name: 'Dark Blue Slim Jeans',
        category: 'bottoms',
        subcategory: 'jeans',
        color: 'dark blue',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg',
        tags: ['casual', 'versatile', 'everyday'],
        favorite: true
      },
      {
        name: 'Khaki Chinos',
        category: 'bottoms',
        subcategory: 'pants',
        color: 'khaki',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg',
        tags: ['smart casual', 'office', 'versatile'],
        favorite: true
      },
      {
        name: 'Grey Wool Trousers',
        category: 'bottoms',
        subcategory: 'pants',
        color: 'grey',
        season: 'fall,winter',
        imageUrl: 'https://images.pexels.com/photos/3030362/pexels-photo-3030362.jpeg',
        tags: ['formal', 'business', 'elegant'],
        favorite: false
      },
      {
        name: 'Black Dress Pants',
        category: 'bottoms',
        subcategory: 'pants',
        color: 'black',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/1639729/pexels-photo-1639729.jpeg',
        tags: ['formal', 'business', 'evening'],
        favorite: true
      }
    ];

    // Outerwear
    const outerwear = [
      {
        name: 'Navy Blazer',
        category: 'outerwear',
        subcategory: 'blazer',
        color: 'navy',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/6969935/pexels-photo-6969935.jpeg',
        tags: ['formal', 'business', 'smart casual'],
        favorite: true
      },
      {
        name: 'Black Leather Jacket',
        category: 'outerwear',
        subcategory: 'jacket',
        color: 'black',
        season: 'fall,winter',
        imageUrl: 'https://images.pexels.com/photos/4455260/pexels-photo-4455260.jpeg',
        tags: ['edgy', 'casual', 'evening'],
        favorite: true
      },
      {
        name: 'Tan Trench Coat',
        category: 'outerwear',
        subcategory: 'coat',
        color: 'tan',
        season: 'fall,winter',
        imageUrl: 'https://images.pexels.com/photos/1300572/pexels-photo-1300572.jpeg',
        tags: ['classic', 'elegant', 'business'],
        favorite: false
      },
      {
        name: 'Grey Wool Overcoat',
        category: 'outerwear',
        subcategory: 'coat',
        color: 'grey',
        season: 'winter',
        imageUrl: 'https://images.pexels.com/photos/2887879/pexels-photo-2887879.jpeg',
        tags: ['elegant', 'formal', 'winter'],
        favorite: true
      }
    ];

    // Shoes
    const shoes = [
      {
        name: 'Brown Leather Oxford Shoes',
        category: 'shoes',
        subcategory: 'dress shoes',
        color: 'brown',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/293405/pexels-photo-293405.jpeg',
        tags: ['formal', 'business', 'classic'],
        favorite: true
      },
      {
        name: 'White Sneakers',
        category: 'shoes',
        subcategory: 'sneakers',
        color: 'white',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/5710164/pexels-photo-5710164.jpeg',
        tags: ['casual', 'everyday', 'versatile'],
        favorite: true
      },
      {
        name: 'Black Chelsea Boots',
        category: 'shoes',
        subcategory: 'boots',
        color: 'black',
        season: 'fall,winter',
        imageUrl: 'https://images.pexels.com/photos/267242/pexels-photo-267242.jpeg',
        tags: ['smart casual', 'versatile', 'stylish'],
        favorite: true
      },
      {
        name: 'Brown Loafers',
        category: 'shoes',
        subcategory: 'loafers',
        color: 'brown',
        season: 'spring,summer,fall',
        imageUrl: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
        tags: ['smart casual', 'business casual', 'versatile'],
        favorite: false
      }
    ];

    // Accessories
    const accessories = [
      {
        name: 'Black Leather Belt',
        category: 'accessories',
        subcategory: 'belt',
        color: 'black',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/45924/pexels-photo-45924.jpeg',
        tags: ['formal', 'business', 'essential'],
        favorite: true
      },
      {
        name: 'Silver Watch',
        category: 'accessories',
        subcategory: 'watch',
        color: 'silver',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/9979/pexels-photo.jpg',
        tags: ['formal', 'elegant', 'everyday'],
        favorite: true
      },
      {
        name: 'Navy Blue Tie',
        category: 'accessories',
        subcategory: 'tie',
        color: 'navy',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg',
        tags: ['formal', 'business', 'classic'],
        favorite: false
      },
      {
        name: 'Brown Leather Wallet',
        category: 'accessories',
        subcategory: 'wallet',
        color: 'brown',
        season: 'all',
        imageUrl: 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg',
        tags: ['essential', 'everyday', 'classic'],
        favorite: true
      }
    ];

    // Combine all wardrobe items
    const allItems = [...tops, ...bottoms, ...outerwear, ...shoes, ...accessories];
    const itemIds = [];

    // Insert wardrobe items
    for (const item of allItems) {
      const result = await client.query(
        `INSERT INTO wardrobe_items (user_id, name, category, subcategory, color, season, image_url, tags, favorite)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [userId, item.name, item.category, item.subcategory, item.color, item.season, item.imageUrl, item.tags, item.favorite]
      );
      
      itemIds.push(result.rows[0].id);
      console.log(`Added wardrobe item: ${item.name} with ID: ${result.rows[0].id}`);
    }

    // Map item names to their IDs for outfit creation
    const itemMap = {};
    for (let i = 0; i < allItems.length; i++) {
      itemMap[allItems[i].name] = itemIds[i];
    }

    // 3. Create outfits
    const outfits = [
      {
        name: 'Business Professional',
        items: [
          itemMap['White Oxford Shirt'],
          itemMap['Grey Wool Trousers'],
          itemMap['Navy Blazer'],
          itemMap['Brown Leather Oxford Shoes'],
          itemMap['Black Leather Belt'],
          itemMap['Silver Watch'],
          itemMap['Navy Blue Tie']
        ],
        occasion: 'work',
        season: 'all',
        favorite: true,
        weatherConditions: 'sunny,cloudy',
        mood: 'professional'
      },
      {
        name: 'Smart Casual',
        items: [
          itemMap['Navy Blue Polo'],
          itemMap['Khaki Chinos'],
          itemMap['Brown Loafers'],
          itemMap['Silver Watch'],
          itemMap['Black Leather Belt']
        ],
        occasion: 'casual',
        season: 'spring,summer',
        favorite: true,
        weatherConditions: 'sunny,cloudy',
        mood: 'relaxed'
      },
      {
        name: 'Night Out',
        items: [
          itemMap['Black Turtleneck Sweater'],
          itemMap['Dark Blue Slim Jeans'],
          itemMap['Black Chelsea Boots'],
          itemMap['Black Leather Jacket'],
          itemMap['Silver Watch']
        ],
        occasion: 'evening',
        season: 'fall,winter',
        favorite: true,
        weatherConditions: 'cloudy,cold',
        mood: 'confident'
      },
      {
        name: 'Casual Weekend',
        items: [
          itemMap['Grey Crewneck T-shirt'],
          itemMap['Dark Blue Slim Jeans'],
          itemMap['White Sneakers'],
          itemMap['Brown Leather Wallet']
        ],
        occasion: 'casual',
        season: 'all',
        favorite: true,
        weatherConditions: 'sunny,cloudy',
        mood: 'relaxed'
      },
      {
        name: 'Fall Layers',
        items: [
          itemMap['Blue Denim Shirt'],
          itemMap['Dark Blue Slim Jeans'],
          itemMap['Tan Trench Coat'],
          itemMap['Brown Leather Oxford Shoes'],
          itemMap['Brown Leather Belt']
        ],
        occasion: 'casual',
        season: 'fall',
        favorite: false,
        weatherConditions: 'cloudy,windy',
        mood: 'relaxed'
      },
      {
        name: 'Winter Formal',
        items: [
          itemMap['White Oxford Shirt'],
          itemMap['Black Dress Pants'],
          itemMap['Grey Wool Overcoat'],
          itemMap['Black Chelsea Boots'],
          itemMap['Silver Watch'],
          itemMap['Navy Blue Tie']
        ],
        occasion: 'formal',
        season: 'winter',
        favorite: true,
        weatherConditions: 'cold,snowy',
        mood: 'confident'
      }
    ];

    // Insert outfits
    for (const outfit of outfits) {
      await client.query(
        `INSERT INTO outfits (user_id, name, items, occasion, season, favorite, weather_conditions, mood)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, outfit.name, outfit.items, outfit.occasion, outfit.season, outfit.favorite, outfit.weatherConditions, outfit.mood]
      );
      
      console.log(`Added outfit: ${outfit.name}`);
    }

    // 4. Add weather preferences
    const weatherPreferences = [
      {
        weatherType: 'cold',
        preferredCategories: ['outerwear', 'tops', 'bottoms']
      },
      {
        weatherType: 'hot',
        preferredCategories: ['tops', 'bottoms']
      },
      {
        weatherType: 'rainy',
        preferredCategories: ['outerwear', 'shoes']
      }
    ];

    for (const pref of weatherPreferences) {
      await client.query(
        `INSERT INTO weather_preferences (user_id, weather_type, preferred_categories)
         VALUES ($1, $2, $3)`,
        [userId, pref.weatherType, pref.preferredCategories]
      );
      
      console.log(`Added weather preference for: ${pref.weatherType}`);
    }

    // 5. Add mood preferences
    const moodPreferences = [
      {
        mood: 'professional',
        preferredCategories: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'],
        preferredColors: ['navy', 'grey', 'black', 'white']
      },
      {
        mood: 'relaxed',
        preferredCategories: ['tops', 'bottoms', 'shoes'],
        preferredColors: ['blue', 'grey', 'white', 'khaki']
      },
      {
        mood: 'confident',
        preferredCategories: ['tops', 'bottoms', 'outerwear', 'accessories'],
        preferredColors: ['black', 'dark blue', 'grey']
      }
    ];

    for (const pref of moodPreferences) {
      await client.query(
        `INSERT INTO mood_preferences (user_id, mood, preferred_categories, preferred_colors)
         VALUES ($1, $2, $3, $4)`,
        [userId, pref.mood, pref.preferredCategories, pref.preferredColors]
      );
      
      console.log(`Added mood preference for: ${pref.mood}`);
    }

    await client.query('COMMIT');
    console.log('Demo user successfully created with a complete wardrobe and outfits!');
    console.log('Login with username: demouser and password: demopassword');
    
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error creating demo user:', e);
    throw e;
  } finally {
    client.release();
    pool.end();
  }
}

createDemoUser().catch(console.error);