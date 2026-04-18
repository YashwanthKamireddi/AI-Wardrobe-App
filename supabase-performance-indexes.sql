-- ============================================
-- Vessura - Performance Indexes Migration
-- ============================================
-- Additional indexes for optimized query performance
-- ============================================

-- ============================================
-- Trips Table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  climate VARCHAR(50),
  activities TEXT[],
  packed_items INTEGER[],
  outfits INTEGER[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_dates ON trips(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trips_upcoming ON trips(user_id, start_date) WHERE start_date >= CURRENT_DATE;

-- ============================================
-- Outfit Calendar Table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS outfit_calendar (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  occasion VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar indexes for scheduling queries
CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON outfit_calendar(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_outfit ON outfit_calendar(outfit_id);
CREATE INDEX IF NOT EXISTS idx_calendar_upcoming ON outfit_calendar(user_id, date) WHERE date >= CURRENT_DATE;

-- ============================================
-- Additional Performance Indexes
-- ============================================

-- Wardrobe: Favorite items quick access
CREATE INDEX IF NOT EXISTS idx_wardrobe_favorites ON wardrobe_items(user_id) WHERE favorite = TRUE;

-- Wardrobe: Recently added items
CREATE INDEX IF NOT EXISTS idx_wardrobe_recent ON wardrobe_items(user_id, created_at DESC);

-- Outfits: Favorite outfits quick access
CREATE INDEX IF NOT EXISTS idx_outfits_favorites ON outfits(user_id) WHERE favorite = TRUE;

-- Outfits: Season filtering
CREATE INDEX IF NOT EXISTS idx_outfits_season ON outfits(user_id, season);

-- Wear history: Monthly analytics
CREATE INDEX IF NOT EXISTS idx_wear_history_monthly ON item_wear_history(user_id, DATE_TRUNC('month', worn_date));

-- ============================================
-- Row Level Security for new tables
-- ============================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access only" ON trips
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access only" ON outfit_calendar
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Success Message
-- ============================================
SELECT 'Performance indexes migration complete!' as message;
