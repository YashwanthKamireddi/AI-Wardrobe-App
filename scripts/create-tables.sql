-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create index on sessions
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'user'
);

-- Wardrobe items table
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
);

-- Outfits table
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
);

-- Inspirations table
CREATE TABLE IF NOT EXISTS inspirations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  tags TEXT[],
  category TEXT,
  source TEXT,
  content TEXT
);

-- Weather preferences table
CREATE TABLE IF NOT EXISTS weather_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  weather_type TEXT NOT NULL,
  preferred_categories TEXT[]
);

-- Mood preferences table
CREATE TABLE IF NOT EXISTS mood_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  mood TEXT NOT NULL,
  preferred_categories TEXT[],
  preferred_colors TEXT[]
);