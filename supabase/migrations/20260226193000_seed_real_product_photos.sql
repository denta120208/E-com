-- Seed real-looking catalog images (shoes, apparel, accessories)
-- This migration upserts categories and products with photo URLs.

WITH upserted_categories AS (
  INSERT INTO categories (name, slug, description, image_url)
  VALUES
    (
      'Sneakers',
      'sneakers',
      'Sepatu sneakers untuk harian dan olahraga ringan',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
    ),
    (
      'Sports',
      'sports',
      'Perlengkapan olahraga dan outdoor',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80'
    ),
    (
      'Outerwear',
      'outerwear',
      'Jaket, hoodie, dan layer premium',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
    ),
    (
      'Accessories',
      'accessories',
      'Tas, topi, dan aksesoris gaya',
      'https://images.unsplash.com/photo-1506629905607-45f7d8da98ec?auto=format&fit=crop&w=1200&q=80'
    )
  ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    updated_at = NOW()
  RETURNING id, slug
),
category_map AS (
  SELECT id, slug FROM upserted_categories
  UNION
  SELECT id, slug
  FROM categories
  WHERE slug IN ('sneakers', 'sports', 'outerwear', 'accessories')
)
INSERT INTO products (
  name,
  slug,
  description,
  price,
  discount_price,
  stock,
  sku,
  category_id,
  images,
  thumbnail_url,
  is_featured,
  is_active
)
VALUES
  (
    'Aero Street Runner',
    'aero-street-runner',
    'Sepatu running harian dengan upper mesh breathable dan outsole grip fleksibel.',
    899000,
    749000,
    42,
    'SNK-001',
    (SELECT id FROM category_map WHERE slug = 'sneakers'),
    ARRAY[
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    true,
    true
  ),
  (
    'Summit Trail Pro',
    'summit-trail-pro',
    'Sepatu trail dengan midsole empuk dan perlindungan toe-cap untuk jalur outdoor.',
    1199000,
    NULL,
    28,
    'SNK-002',
    (SELECT id FROM category_map WHERE slug = 'sports'),
    ARRAY[
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80',
    true,
    true
  ),
  (
    'Velocity Knit Trainer',
    'velocity-knit-trainer',
    'Sneakers knit ringan untuk training, gym, dan aktivitas harian.',
    799000,
    699000,
    55,
    'SNK-003',
    (SELECT id FROM category_map WHERE slug = 'sneakers'),
    ARRAY[
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80',
    true,
    true
  ),
  (
    'Monarch Essential Hoodie',
    'monarch-essential-hoodie',
    'Hoodie cotton fleece premium dengan fit relaxed dan finishing clean seam.',
    459000,
    NULL,
    73,
    'OUT-001',
    (SELECT id FROM category_map WHERE slug = 'outerwear'),
    ARRAY[
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80',
    false,
    true
  ),
  (
    'Urban Shell Jacket',
    'urban-shell-jacket',
    'Jaket shell tahan angin dengan lapisan water-repellent untuk komuter.',
    699000,
    589000,
    31,
    'OUT-002',
    (SELECT id FROM category_map WHERE slug = 'outerwear'),
    ARRAY[
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80',
    false,
    true
  ),
  (
    'Transit Daypack 24L',
    'transit-daypack-24l',
    'Backpack 24L dengan kompartemen laptop dan kantong organizer harian.',
    399000,
    339000,
    64,
    'ACC-001',
    (SELECT id FROM category_map WHERE slug = 'accessories'),
    ARRAY[
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    false,
    true
  ),
  (
    'Motion Baseball Cap',
    'motion-baseball-cap',
    'Topi baseball dengan bahan breathable dan adjustable strap.',
    149000,
    NULL,
    88,
    'ACC-002',
    (SELECT id FROM category_map WHERE slug = 'accessories'),
    ARRAY[
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
    false,
    true
  ),
  (
    'Pace Running Tee',
    'pace-running-tee',
    'Kaos training quick-dry untuk lari dan fitness harian.',
    199000,
    169000,
    95,
    'SPT-001',
    (SELECT id FROM category_map WHERE slug = 'sports'),
    ARRAY[
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80',
    false,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock = EXCLUDED.stock,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  thumbnail_url = EXCLUDED.thumbnail_url,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
