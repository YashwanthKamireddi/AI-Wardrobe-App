-- Database Schema for Wardrobe Application
-- This SQL script creates all the necessary tables for the application

-- Drop tables if they exist
DROP TABLE IF EXISTS mood_preferences;
DROP TABLE IF EXISTS weather_preferences;
DROP TABLE IF EXISTS inspirations;
DROP TABLE IF EXISTS outfits;
DROP TABLE IF EXISTS wardrobe_items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS session;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  password TEXT NOT NULL,
  fullname TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create wardrobe_items table
CREATE TABLE wardrobe_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  color TEXT,
  image_url TEXT,
  brand TEXT,
  season TEXT[],
  occasion TEXT[],
  favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create outfits table
CREATE TABLE outfits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  items INTEGER[] NOT NULL,
  occasion TEXT,
  season TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  weather_conditions TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inspirations table
CREATE TABLE inspirations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  tags TEXT[],
  category TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_preferences table
CREATE TABLE weather_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  weather_type TEXT NOT NULL,
  preferred_categories TEXT[],
  avoid_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create mood_preferences table
CREATE TABLE mood_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  mood TEXT NOT NULL,
  preferred_categories TEXT[],
  preferred_colors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create session table for session management
CREATE TABLE session (
  sid VARCHAR NOT NULL,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid)
);

-- Add indexes
CREATE INDEX ON wardrobe_items (user_id);
CREATE INDEX ON outfits (user_id);
CREATE INDEX ON weather_preferences (user_id);
CREATE INDEX ON mood_preferences (user_id);
CREATE INDEX IDX_session_expire ON session (expire);

-- Add foreign key constraints
ALTER TABLE wardrobe_items ADD CONSTRAINT fk_wardrobe_items_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE outfits ADD CONSTRAINT fk_outfits_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE weather_preferences ADD CONSTRAINT fk_weather_preferences_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE mood_preferences ADD CONSTRAINT fk_mood_preferences_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add a test user
INSERT INTO users (username, email, password, fullname)
VALUES ('fashionuser', 'user@example.com', '$2b$10$zRJw.7RXWMbvE7nShs3aK.O17Q8QMzYidagYE8anS1XJtBcUUNOSq', 'Fashion User');
-- The password is 'password123'

-- Add some sample inspirations
INSERT INTO inspirations (title, description, image_url, tags, category, source)
VALUES 
  ('Summer Casual Look', 'Light and breezy outfit for hot summer days', 'https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg', ARRAY['summer', 'casual', 'beach'], 'casual', 'Pexels'),
  ('Office Chic', 'Professional outfit for the workplace', 'https://images.pexels.com/photos/2817854/pexels-photo-2817854.jpeg', ARRAY['work', 'formal', 'business'], 'formal', 'Pexels'),
  ('Weekend Style', 'Comfortable yet stylish weekend outfit', 'https://images.pexels.com/photos/1071162/pexels-photo-1071162.jpeg', ARRAY['casual', 'weekend', 'style'], 'casual', 'Pexels');

-- Let the user know the script completed successfully
SELECT 'Database schema created successfully!' AS result;