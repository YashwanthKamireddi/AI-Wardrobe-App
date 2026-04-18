-- ============================================
-- 005: Style DNA profiles — cached scoring per user
-- Run in Supabase SQL Editor after 004. Idempotent.
-- ============================================

CREATE TABLE IF NOT EXISTS style_profiles (
    id SERIAL PRIMARY KEY,
    user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    archetype          VARCHAR(40) NOT NULL,
    style_score        INTEGER NOT NULL,
    color_harmony      INTEGER NOT NULL,
    versatility_score  INTEGER NOT NULL,
    maturity_score     INTEGER NOT NULL,
    dominant_colors    TEXT[] DEFAULT ARRAY[]::TEXT[],
    category_breakdown JSONB  DEFAULT '{}'::JSONB,
    traits             TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_items        INTEGER NOT NULL DEFAULT 0,
    computed_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_style_profiles_user ON style_profiles(user_id);
