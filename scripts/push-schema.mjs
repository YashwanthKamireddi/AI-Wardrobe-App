/**
 * Custom schema push script that ensures the password is used correctly
 */

import { Pool } from 'pg';
// We can't import the schema directly due to TypeScript/ESM issues
// So we'll just create the tables directly with SQL queries
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get actual password from environment
const password = process.env.PGPASSWORD || 'postgres';

console.log('Setting up database connection...');
console.log('Host:', process.env.PGHOST || 'localhost');
console.log('Port:', process.env.PGPORT || '5432');
console.log('Database:', process.env.PGDATABASE || 'chers_closet_db');
console.log('User:', process.env.PGUSER || 'postgres');

// Create database connection
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: password,
  database: process.env.PGDATABASE || 'chers_closet_db'
});

// We're using direct SQL queries so we don't need a Drizzle ORM instance

// Main function
async function main() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    client.release();

    console.log('\nCreating database schema...');
    // We'll use a direct approach to create tables since drizzle-kit is having issues
    
    // First, create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    console.log('✅ Sessions table created/verified');
    
    // Create index on sessions
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)
    `);
    console.log('✅ Sessions index created/verified');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT,
        email TEXT,
        profile_picture TEXT,
        role TEXT DEFAULT 'user'
      )
    `);
    console.log('✅ Users table created/verified');
    
    // Create wardrobe_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wardrobe_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        color TEXT,
        season TEXT,
        image_url TEXT NOT NULL,
        tags TEXT[],
        favorite BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Wardrobe items table created/verified');
    
    // Create outfits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS outfits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        items INTEGER[] NOT NULL,
        occasion TEXT,
        season TEXT,
        favorite BOOLEAN DEFAULT false,
        weather_conditions TEXT,
        mood TEXT
      )
    `);
    console.log('✅ Outfits table created/verified');
    
    // Create inspirations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inspirations (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        tags TEXT[],
        category TEXT,
        source TEXT,
        content TEXT
      )
    `);
    console.log('✅ Inspirations table created/verified');
    
    // Create weather_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        weather_type TEXT NOT NULL,
        preferred_categories TEXT[]
      )
    `);
    console.log('✅ Weather preferences table created/verified');
    
    // Create mood_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mood_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        mood TEXT NOT NULL,
        preferred_categories TEXT[],
        preferred_colors TEXT[]
      )
    `);
    console.log('✅ Mood preferences table created/verified');

    console.log('\n✅ All database tables created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '28P01') {
      console.error('\nPassword authentication failed. Double check your password in .env file.');
      console.error('Your current password is set to:', password);
    }
  } finally {
    await pool.end();
  }
}

// Run the main function
main();