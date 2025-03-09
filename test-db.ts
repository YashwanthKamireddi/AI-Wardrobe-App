import { db } from './server/db';
import * as schema from './shared/schema';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test querying the users table
    const users = await db.select().from(schema.users).limit(5);
    console.log('Users:', users);
    
    // Test querying the wardrobe_items table
    const wardrobeItems = await db.select().from(schema.wardrobeItems).limit(5);
    console.log('Wardrobe items:', wardrobeItems);
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testDatabaseConnection();