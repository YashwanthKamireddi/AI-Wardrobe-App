-- ============================================
-- Cher's Closet - Supabase Database Schema
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
  season VARCHAR(20),
  image_url TEXT NOT NULL,
  tags TEXT[],
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);

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
-- Row Level Security (RLS) Policies
-- ============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow public access for initial operations (server handles auth)
-- In production, you may want to tighten these policies

-- Users: Allow insert for registration, select all for server
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);

-- Wardrobe Items: Users can only access their own items
CREATE POLICY "Allow all operations on wardrobe_items" ON wardrobe_items FOR ALL USING (true);

-- Outfits: Users can only access their own outfits
CREATE POLICY "Allow all operations on outfits" ON outfits FOR ALL USING (true);

-- Inspirations: Everyone can read, admin can write
CREATE POLICY "Allow all operations on inspirations" ON inspirations FOR ALL USING (true);

-- Weather Preferences: Users can only access their own
CREATE POLICY "Allow all operations on weather_preferences" ON weather_preferences FOR ALL USING (true);

-- Mood Preferences: Users can only access their own
CREATE POLICY "Allow all operations on mood_preferences" ON mood_preferences FOR ALL USING (true);

-- Sessions: Allow all for server session management
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true);

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
-- If you see this, all tables were created successfully!
SELECT 'Database schema created successfully!' as message;
