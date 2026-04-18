-- ============================================
-- 005: Style DNA profiles — cached scoring per user
-- Run in Supabase SQL Editor after 004.
-- Self-healing: if the table existed in a partial state from a
-- previous run, ADD COLUMN IF NOT EXISTS fills in the gaps.
-- ============================================

CREATE TABLE IF NOT EXISTS style_profiles (
    id SERIAL PRIMARY KEY
);

ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS user_id            INTEGER;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS archetype          VARCHAR(40);
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS style_score        INTEGER;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS color_harmony      INTEGER;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS versatility_score  INTEGER;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS maturity_score     INTEGER;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS dominant_colors    TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS category_breakdown JSONB  DEFAULT '{}'::JSONB;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS traits             TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS total_items        INTEGER DEFAULT 0;
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS computed_at        TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE style_profiles ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'style_profiles_user_fk') THEN
        ALTER TABLE style_profiles ADD CONSTRAINT style_profiles_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'style_profiles_user_unique') THEN
        ALTER TABLE style_profiles ADD CONSTRAINT style_profiles_user_unique UNIQUE (user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_style_profiles_user ON style_profiles(user_id);
