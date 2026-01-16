-- ============================================
-- Celura - Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create all tables
-- Go to: Your Project -> SQL Editor -> New Query
-- ============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  profile_picture TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- Wardrobe Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  color VARCHAR(50),
  brand VARCHAR(100),
  size VARCHAR(20),
  season VARCHAR(20),
  image_url TEXT NOT NULL,
  tags TEXT[],
  favorite BOOLEAN DEFAULT FALSE,
  wear_count INTEGER DEFAULT 0,
  last_worn TIMESTAMPTZ,
  purchase_price NUMERIC(10,2),
  purchase_date DATE,
  purchase_location VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(user_id, category);

-- ============================================
-- Outfits Table
-- ============================================
CREATE TABLE IF NOT EXISTS outfits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  items INTEGER[] NOT NULL,
  occasion VARCHAR(50),
  season VARCHAR(20),
  favorite BOOLEAN DEFAULT FALSE,
  weather_conditions VARCHAR(50),
  mood VARCHAR(50),
  wear_count INTEGER DEFAULT 0,
  last_worn TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);

-- ============================================
-- Wear Log Table (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS wear_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wardrobe_item_id INTEGER REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  outfit_id INTEGER REFERENCES outfits(id) ON DELETE CASCADE,
  worn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  occasion VARCHAR(50),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for wear log lookups
CREATE INDEX IF NOT EXISTS idx_wear_log_user_id ON wear_log(user_id);
CREATE INDEX IF NOT EXISTS idx_wear_log_item_id ON wear_log(wardrobe_item_id);
CREATE INDEX IF NOT EXISTS idx_wear_log_outfit_id ON wear_log(outfit_id);

-- ============================================
-- Inspirations Table
-- ============================================
CREATE TABLE IF NOT EXISTS inspirations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  source VARCHAR(200),
  tags TEXT[],
  category VARCHAR(50),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Weather Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS weather_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weather_type VARCHAR(50) NOT NULL,
  preferred_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_weather_preferences_user_id ON weather_preferences(user_id);

-- ============================================
-- Mood Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS mood_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  preferred_categories TEXT[],
  preferred_colors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_mood_preferences_user_id ON mood_preferences(user_id);

-- ============================================
-- Sessions Table (for Express Session)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

-- Create index for session expiry cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- ============================================
-- Helper Functions for Wear Tracking
-- ============================================

-- Function to increment wear count on wardrobe items
CREATE OR REPLACE FUNCTION increment_wear_count(item_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE wardrobe_items
  SET wear_count = COALESCE(wear_count, 0) + 1,
      last_worn = NOW(),
      updated_at = NOW()
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment wear count on outfits
CREATE OR REPLACE FUNCTION increment_outfit_wear_count(outfit_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE outfits
  SET wear_count = COALESCE(wear_count, 0) + 1,
      last_worn = NOW()
  WHERE id = outfit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- NOTE: This app uses server-side authentication via Express sessions.
-- The server connects using the service role key which bypasses RLS.
-- These policies prevent direct client access to the database.

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wear_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on wardrobe_items" ON wardrobe_items;
DROP POLICY IF EXISTS "Allow all operations on outfits" ON outfits;
DROP POLICY IF EXISTS "Allow all operations on inspirations" ON inspirations;
DROP POLICY IF EXISTS "Allow all operations on weather_preferences" ON weather_preferences;
DROP POLICY IF EXISTS "Allow all operations on mood_preferences" ON mood_preferences;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;

-- Users: Server manages auth, only allow service role
CREATE POLICY "Service role access only" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Wardrobe Items: Service role only (server handles user scoping)
CREATE POLICY "Service role access only" ON wardrobe_items
  FOR ALL USING (auth.role() = 'service_role');

-- Outfits: Service role only
CREATE POLICY "Service role access only" ON outfits
  FOR ALL USING (auth.role() = 'service_role');

-- Wear Log: Service role only
CREATE POLICY "Service role access only" ON wear_log
  FOR ALL USING (auth.role() = 'service_role');

-- Inspirations: Read for anon, full access for service role
CREATE POLICY "Anon can read inspirations" ON inspirations
  FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON inspirations
  FOR ALL USING (auth.role() = 'service_role');

-- Weather Preferences: Service role only
CREATE POLICY "Service role access only" ON weather_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- Mood Preferences: Service role only
CREATE POLICY "Service role access only" ON mood_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- Sessions: Service role only
CREATE POLICY "Service role access only" ON sessions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Sample Inspirations Data
-- ============================================
INSERT INTO inspirations (title, description, image_url, source, tags, category, content) VALUES
  ('Minimalist Elegance', 'Clean lines and neutral tones for a timeless look', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', 'Vogue', ARRAY['minimalist', 'elegant', 'neutral'], 'formal', 'Embrace the beauty of simplicity with carefully curated pieces'),
  ('Street Style Chic', 'Urban fashion with a sophisticated twist', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', 'Elle', ARRAY['streetwear', 'urban', 'trendy'], 'casual', 'Mix high and low pieces for an effortlessly cool look'),
  ('Bohemian Dreams', 'Free-spirited fashion with flowing fabrics', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600', 'Harper''s Bazaar', ARRAY['bohemian', 'flowy', 'romantic'], 'casual', 'Embrace your inner free spirit with relaxed silhouettes'),
  ('Power Dressing', 'Command attention with bold professional looks', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600', 'Forbes Style', ARRAY['professional', 'powerful', 'bold'], 'formal', 'Dress for success with structured, confident pieces'),
  ('Casual Friday', 'Relaxed yet polished weekend wear', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', 'GQ', ARRAY['casual', 'relaxed', 'weekend'], 'casual', 'Perfect balance between comfort and style'),
  ('Evening Glamour', 'Stunning looks for special occasions', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600', 'Glamour', ARRAY['evening', 'glamorous', 'special occasion'], 'formal', 'Make a statement at your next event')
ON CONFLICT DO NOTHING;

-- ============================================
-- Success Message
-- ============================================
SELECT 'Database schema created successfully!' as message;
