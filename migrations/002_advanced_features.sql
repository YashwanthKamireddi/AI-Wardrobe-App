-- Capsule Wardrobes Table
CREATE TABLE IF NOT EXISTS capsule_wardrobes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    type VARCHAR(50) DEFAULT 'custom' CHECK (type IN ('seasonal', 'travel', 'work', 'casual', 'custom')),
    season VARCHAR(20) DEFAULT 'all' CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all')),
    items INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    price DECIMAL(10, 2),
    url TEXT,
    image_url TEXT,
    category VARCHAR(100),
    notes TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    purchased BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wear Log Table (for outfit tracking)
CREATE TABLE IF NOT EXISTS wear_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id INTEGER REFERENCES outfits(id) ON DELETE SET NULL,
    wardrobe_item_ids INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    photo_url TEXT,
    occasion VARCHAR(100),
    weather_condition VARCHAR(50),
    temperature INTEGER,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    worn_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_capsules_user_id ON capsule_wardrobes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wear_logs_user_id ON wear_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wear_logs_worn_date ON wear_logs(worn_date);
CREATE INDEX IF NOT EXISTS idx_wear_logs_outfit_id ON wear_logs(outfit_id);

-- Add season column to wardrobe_items if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'wardrobe_items' AND column_name = 'season'
    ) THEN
        ALTER TABLE wardrobe_items ADD COLUMN season VARCHAR(20) DEFAULT 'all';
    END IF;
END $$;
