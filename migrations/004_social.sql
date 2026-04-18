-- ============================================
-- 004: Social features (follows, likes, challenges, shares)
-- Run in Supabase SQL Editor after 002 and 003.
-- Idempotent AND self-healing: if a prior run left a table in a
-- partial state, the ADD COLUMN IF NOT EXISTS clauses fix it in place
-- instead of silently skipping.
-- ============================================

-- --------------------------------------------------------------
-- Follows
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY
);

ALTER TABLE follows ADD COLUMN IF NOT EXISTS follower_id  INTEGER;
ALTER TABLE follows ADD COLUMN IF NOT EXISTS following_id INTEGER;
ALTER TABLE follows ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();

-- Attach FKs + uniqueness only if they're not already there.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_follower_fk') THEN
        ALTER TABLE follows ADD CONSTRAINT follows_follower_fk
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_following_fk') THEN
        ALTER TABLE follows ADD CONSTRAINT follows_following_fk
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_unique_pair') THEN
        ALTER TABLE follows ADD CONSTRAINT follows_unique_pair UNIQUE (follower_id, following_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_not_self') THEN
        ALTER TABLE follows ADD CONSTRAINT follows_not_self CHECK (follower_id <> following_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- --------------------------------------------------------------
-- Outfit likes
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outfit_likes (
    id SERIAL PRIMARY KEY
);

ALTER TABLE outfit_likes ADD COLUMN IF NOT EXISTS outfit_id  INTEGER;
ALTER TABLE outfit_likes ADD COLUMN IF NOT EXISTS user_id    INTEGER;
ALTER TABLE outfit_likes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outfit_likes_outfit_fk') THEN
        ALTER TABLE outfit_likes ADD CONSTRAINT outfit_likes_outfit_fk
            FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outfit_likes_user_fk') THEN
        ALTER TABLE outfit_likes ADD CONSTRAINT outfit_likes_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outfit_likes_unique_pair') THEN
        ALTER TABLE outfit_likes ADD CONSTRAINT outfit_likes_unique_pair UNIQUE (outfit_id, user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit ON outfit_likes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user   ON outfit_likes(user_id);

-- --------------------------------------------------------------
-- Challenges
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY
);

ALTER TABLE challenges ADD COLUMN IF NOT EXISTS name        VARCHAR(200);
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS prize       TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS end_date    TIMESTAMPTZ;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS status      VARCHAR(30) DEFAULT 'active';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_status_values') THEN
        ALTER TABLE challenges ADD CONSTRAINT challenges_status_values
            CHECK (status IN ('active','closed','archived'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- --------------------------------------------------------------
-- Challenge submissions
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id SERIAL PRIMARY KEY
);

ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS challenge_id INTEGER;
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS user_id      INTEGER;
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS outfit_id    INTEGER;
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_submissions_challenge_fk') THEN
        ALTER TABLE challenge_submissions ADD CONSTRAINT challenge_submissions_challenge_fk
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_submissions_user_fk') THEN
        ALTER TABLE challenge_submissions ADD CONSTRAINT challenge_submissions_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_submissions_outfit_fk') THEN
        ALTER TABLE challenge_submissions ADD CONSTRAINT challenge_submissions_outfit_fk
            FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_submissions_unique_pair') THEN
        ALTER TABLE challenge_submissions ADD CONSTRAINT challenge_submissions_unique_pair UNIQUE (challenge_id, user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user      ON challenge_submissions(user_id);

-- --------------------------------------------------------------
-- Outfit shares
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outfit_shares (
    id SERIAL PRIMARY KEY
);

ALTER TABLE outfit_shares ADD COLUMN IF NOT EXISTS outfit_id  INTEGER;
ALTER TABLE outfit_shares ADD COLUMN IF NOT EXISTS user_id    INTEGER;
ALTER TABLE outfit_shares ADD COLUMN IF NOT EXISTS share_link VARCHAR(64);
ALTER TABLE outfit_shares ADD COLUMN IF NOT EXISTS platform   VARCHAR(40);
ALTER TABLE outfit_shares ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outfit_shares_outfit_fk') THEN
        ALTER TABLE outfit_shares ADD CONSTRAINT outfit_shares_outfit_fk
            FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outfit_shares_user_fk') THEN
        ALTER TABLE outfit_shares ADD CONSTRAINT outfit_shares_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'outfit_shares_link_unique') THEN
        ALTER TABLE outfit_shares ADD CONSTRAINT outfit_shares_link_unique UNIQUE (share_link);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_outfit_shares_link ON outfit_shares(share_link);

-- --------------------------------------------------------------
-- Seed three starter challenges (only if challenges is empty)
-- --------------------------------------------------------------
INSERT INTO challenges (name, description, prize, end_date, status)
SELECT v.name, v.description, v.prize, v.end_date, v.status
FROM (VALUES
    ('Minimalist Monday',  'Create a complete outfit with only 3 pieces', 'Featured on Vessura homepage', NOW() + INTERVAL '7 days',  'active'),
    ('Color Pop Challenge','Style an outfit around a bold accent color',  'Vessura credits',              NOW() + INTERVAL '14 days', 'active'),
    ('Capsule Wardrobe',   'Build 7 unique outfits from only 10 items',   '1 month Premium access',       NOW() + INTERVAL '30 days', 'active')
) AS v(name, description, prize, end_date, status)
WHERE NOT EXISTS (SELECT 1 FROM challenges);
