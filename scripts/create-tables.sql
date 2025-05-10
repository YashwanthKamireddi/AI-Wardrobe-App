-- Sessions table
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create index on sessions
CREATE INDEX IDX_session_expire ON sessions (expire);

-- Users table
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'user'
);

-- Wardrobe items table
DROP TABLE IF EXISTS wardrobe_items CASCADE;
CREATE TABLE wardrobe_items (
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
DROP TABLE IF EXISTS outfits CASCADE;
CREATE TABLE outfits (
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
DROP TABLE IF EXISTS inspirations CASCADE;
CREATE TABLE inspirations (
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
DROP TABLE IF EXISTS weather_preferences CASCADE;
CREATE TABLE weather_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  weather_type TEXT NOT NULL,
  preferred_categories TEXT[]
);

-- Mood preferences table
DROP TABLE IF EXISTS mood_preferences CASCADE;
CREATE TABLE mood_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  mood TEXT NOT NULL,
  preferred_categories TEXT[],
  preferred_colors TEXT[]
);