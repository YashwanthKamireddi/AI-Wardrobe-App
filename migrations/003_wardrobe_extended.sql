-- ============================================
-- 003: Extend wardrobe_items with fields the app already sends
-- Run in Supabase SQL Editor. Idempotent (IF NOT EXISTS).
-- ============================================

ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS brand          VARCHAR(100);
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS size           VARCHAR(20);
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS purchase_price INTEGER;
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS purchase_date  TIMESTAMPTZ;
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS wear_count     INTEGER DEFAULT 0;
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS last_worn      TIMESTAMPTZ;
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS status         VARCHAR(30) DEFAULT 'available';
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS lent_to        VARCHAR(100);
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS return_date    TIMESTAMPTZ;
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS notes          TEXT;

-- Outfit extension: description was missing in early schemas, used by seeded outfits.
ALTER TABLE outfits ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_brand   ON wardrobe_items(brand);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_status  ON wardrobe_items(status);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_last_worn ON wardrobe_items(last_worn);
