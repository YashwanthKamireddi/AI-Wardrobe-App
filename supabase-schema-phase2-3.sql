-- ============================================
-- Phase 2: Social & Community Features
-- ============================================

-- User Follows Table
CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Outfit Likes Table
CREATE TABLE IF NOT EXISTS outfit_likes (
  id SERIAL PRIMARY KEY,
  outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(outfit_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit ON outfit_likes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user ON outfit_likes(user_id);

-- Outfit Shares Table
CREATE TABLE IF NOT EXISTS outfit_shares (
  id SERIAL PRIMARY KEY,
  outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_link VARCHAR(100) UNIQUE NOT NULL,
  platform VARCHAR(50), -- instagram, twitter, facebook, link
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfit_shares_outfit ON outfit_shares(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_shares_link ON outfit_shares(share_link);

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rules JSONB,
  prize TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Submissions Table
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  votes INTEGER DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_votes ON challenge_submissions(challenge_id, votes DESC);

-- Add social fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Add social fields to outfits table
ALTER TABLE outfits ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE outfits ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE outfits ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
ALTER TABLE outfits ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- ============================================
-- Phase 3: Advanced Features
-- ============================================

-- Capsule Wardrobes Table
CREATE TABLE IF NOT EXISTS capsule_wardrobes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- work, weekend, vacation, seasonal
  season VARCHAR(20),
  items INTEGER[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capsule_wardrobes_user ON capsule_wardrobes(user_id);
CREATE INDEX IF NOT EXISTS idx_capsule_wardrobes_active ON capsule_wardrobes(user_id, is_active);

-- Shopping Wishlist Table
CREATE TABLE IF NOT EXISTS shopping_wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  brand VARCHAR(100),
  price NUMERIC(10,2),
  category VARCHAR(50),
  link TEXT,
  versatility_score INTEGER, -- calculated based on existing wardrobe
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  status VARCHAR(20) DEFAULT 'wishlist', -- wishlist, purchased, removed
  added_at TIMESTAMPTZ DEFAULT NOW(),
  purchased_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON shopping_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_status ON shopping_wishlist(user_id, status);

-- Style Profile Table
CREATE TABLE IF NOT EXISTS style_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  style_type VARCHAR(50), -- minimalist, bohemian, classic, edgy, etc.
  color_season VARCHAR(20), -- spring, summer, autumn, winter
  fit_preferences JSONB,
  style_goals TEXT[],
  quiz_results JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sustainability Tracking
CREATE TABLE IF NOT EXISTS sustainability_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50), -- repair, donate, recycle, secondhand_purchase
  item_id INTEGER REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  description TEXT,
  impact_score INTEGER,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sustainability_user ON sustainability_log(user_id);

-- Trigger to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = COALESCE(following_count, 0) + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = OLD.following_id;
    UPDATE users SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_follower_counts
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

-- Trigger to update outfit likes count
CREATE OR REPLACE FUNCTION update_outfit_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE outfits SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.outfit_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE outfits SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.outfit_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_outfit_likes
AFTER INSERT OR DELETE ON outfit_likes
FOR EACH ROW
EXECUTE FUNCTION update_outfit_likes();
