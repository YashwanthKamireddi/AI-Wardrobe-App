-- ============================================
-- 004: Social features (follows, likes, challenges, shares)
-- Run in Supabase SQL Editor AFTER 002 and 003. Idempotent.
-- ============================================

-- Follows: user A follows user B
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Outfit likes
CREATE TABLE IF NOT EXISTS outfit_likes (
    id SERIAL PRIMARY KEY,
    outfit_id  INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (outfit_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit ON outfit_likes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user   ON outfit_likes(user_id);

-- Challenges (community style challenges)
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    prize       TEXT,
    end_date    TIMESTAMPTZ,
    status      VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active','closed','archived')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- Challenge submissions: one outfit per user per challenge
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    outfit_id    INTEGER NOT NULL REFERENCES outfits(id)    ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user      ON challenge_submissions(user_id);

-- Outfit shares (public share links)
CREATE TABLE IF NOT EXISTS outfit_shares (
    id SERIAL PRIMARY KEY,
    outfit_id  INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    share_link VARCHAR(64) NOT NULL UNIQUE,
    platform   VARCHAR(40),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfit_shares_link ON outfit_shares(share_link);

-- Seed three starter challenges (match existing hardcoded UI)
INSERT INTO challenges (name, description, prize, end_date, status)
SELECT * FROM (VALUES
    ('Minimalist Monday',  'Create a complete outfit with only 3 pieces',         'Featured on Vessura homepage', NOW() + INTERVAL '7 days',  'active'),
    ('Color Pop Challenge','Style an outfit around a bold accent color',          'Vessura credits',              NOW() + INTERVAL '14 days', 'active'),
    ('Capsule Wardrobe',   'Build 7 unique outfits from only 10 items',           '1 month Premium access',       NOW() + INTERVAL '30 days', 'active')
) AS v(name, description, prize, end_date, status)
WHERE NOT EXISTS (SELECT 1 FROM challenges);
