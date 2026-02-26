-- Seed catalog data based on src/lib/data.ts
-- Also prepares a public storage bucket for dummy product images.

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read product-images'
  ) THEN
    CREATE POLICY "Public read product-images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;
WITH upserted_categories AS (
  INSERT INTO categories (name, slug, description, image_url)
  VALUES
    (
      'Fashion',
      'fashion',
      'Pakaian dan aksesoris trendy',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/categories/fashion.svg'
    ),
    (
      'Electronics',
      'electronics',
      'Gadget dan elektronik terbaru',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/categories/electronics.svg'
    ),
    (
      'Home & Living',
      'home-living',
      'Perlengkapan rumah tangga',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/categories/home-living.svg'
    ),
    (
      'Beauty',
      'beauty',
      'Produk kecantikan dan perawatan',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/categories/beauty.svg'
    ),
    (
      'Sports',
      'sports',
      'Peralatan olahraga dan fitness',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/categories/sports.svg'
    ),
    (
      'Watches',
      'watches',
      'Jam tangan premium',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/categories/watches.svg'
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
  WHERE slug IN ('fashion', 'electronics', 'home-living', 'beauty', 'sports', 'watches')
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
    'Premium Wireless Headphones',
    'premium-wireless-headphones',
    'Headphone wireless premium dengan noise cancellation, bass mendalam, dan baterai tahan hingga 30 jam. Cocok untuk musik dan kerja.',
    1999000,
    1499000,
    50,
    'WH-001',
    (SELECT id FROM category_map WHERE slug = 'electronics'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/premium-wireless-headphones-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/premium-wireless-headphones-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/premium-wireless-headphones-thumb.svg',
    true,
    true
  ),
  (
    'Smart Watch Pro',
    'smart-watch-pro',
    'Smartwatch dengan monitor detak jantung, GPS, tahan air, dan baterai 7 hari. Kompatibel dengan iOS dan Android.',
    3499000,
    NULL,
    30,
    'SW-002',
    (SELECT id FROM category_map WHERE slug = 'electronics'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/smart-watch-pro-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/smart-watch-pro-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/smart-watch-pro-thumb.svg',
    true,
    true
  ),
  (
    'Leather Backpack',
    'leather-backpack',
    'Tas ransel kulit asli premium dengan kompartemen laptop 15 inch. Desain elegan untuk kerja dan traveling.',
    899000,
    749000,
    25,
    'LB-003',
    (SELECT id FROM category_map WHERE slug = 'fashion'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/leather-backpack-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/leather-backpack-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/leather-backpack-thumb.svg',
    true,
    true
  ),
  (
    'Running Shoes Elite',
    'running-shoes-elite',
    'Sepatu lari profesional dengan teknologi cushioning terbaru. Ringan, breathable, dan nyaman untuk lari jarak jauh.',
    1299000,
    NULL,
    40,
    'RS-004',
    (SELECT id FROM category_map WHERE slug = 'sports'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/running-shoes-elite-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/running-shoes-elite-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/running-shoes-elite-thumb.svg',
    true,
    true
  ),
  (
    'Bluetooth Speaker Portable',
    'bluetooth-speaker-portable',
    'Speaker bluetooth portable dengan suara 360 derajat, bass kuat, dan tahan air IPX7. Baterai 12 jam.',
    599000,
    449000,
    60,
    'BS-005',
    (SELECT id FROM category_map WHERE slug = 'electronics'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/bluetooth-speaker-portable-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/bluetooth-speaker-portable-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/bluetooth-speaker-portable-thumb.svg',
    false,
    true
  ),
  (
    'Minimalist Wrist Watch',
    'minimalist-wrist-watch',
    'Jam tangan minimalis dengan desain modern. Strap kulit asli, mesin quartz Jepang, tahan air 3ATM.',
    799000,
    NULL,
    35,
    'MW-006',
    (SELECT id FROM category_map WHERE slug = 'watches'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/minimalist-wrist-watch-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/minimalist-wrist-watch-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/minimalist-wrist-watch-thumb.svg',
    false,
    true
  ),
  (
    'Yoga Mat Premium',
    'yoga-mat-premium',
    'Matras yoga premium anti-slip, tebal 6mm, material TPE eco-friendly. Termasuk tas carrying.',
    299000,
    249000,
    80,
    'YM-007',
    (SELECT id FROM category_map WHERE slug = 'sports'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/yoga-mat-premium-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/yoga-mat-premium-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/yoga-mat-premium-thumb.svg',
    false,
    true
  ),
  (
    'Desk Lamp LED',
    'desk-lamp-led',
    'Lampu meja LED dengan 5 level kecerahan, USB charging port, dan flexible arm. Hemat energi.',
    199000,
    NULL,
    100,
    'DL-008',
    (SELECT id FROM category_map WHERE slug = 'home-living'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/desk-lamp-led-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/desk-lamp-led-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/desk-lamp-led-thumb.svg',
    false,
    true
  ),
  (
    'Face Serum Vitamin C',
    'face-serum-vitamin-c',
    'Serum wajah dengan 20% Vitamin C murni. Mencerahkan, mengurangi noda hitam, dan anti-aging.',
    189000,
    159000,
    70,
    'FS-009',
    (SELECT id FROM category_map WHERE slug = 'beauty'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/face-serum-vitamin-c-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/face-serum-vitamin-c-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/face-serum-vitamin-c-thumb.svg',
    false,
    true
  ),
  (
    'Cotton T-Shirt Basic',
    'cotton-tshirt-basic',
    'Kaos basic 100% katun combed 30s. Lembut, adem, dan nyaman dipakai sehari-hari. Tersedia berbagai warna.',
    99000,
    79000,
    200,
    'CT-010',
    (SELECT id FROM category_map WHERE slug = 'fashion'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/cotton-tshirt-basic-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/cotton-tshirt-basic-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/cotton-tshirt-basic-thumb.svg',
    true,
    true
  ),
  (
    'Wireless Earbuds',
    'wireless-earbuds',
    'Earbuds wireless dengan charging case, touch control, dan microphone. Sound quality jernih dengan bass mendalam.',
    399000,
    299000,
    90,
    'WE-011',
    (SELECT id FROM category_map WHERE slug = 'electronics'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/wireless-earbuds-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/wireless-earbuds-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/wireless-earbuds-thumb.svg',
    false,
    true
  ),
  (
    'Plant Pot Ceramic Set',
    'plant-pot-ceramic-set',
    'Set 3 pot tanaman keramik minimalis dengan drainase hole. Cocok untuk succulent dan tanaman hias kecil.',
    149000,
    NULL,
    55,
    'PP-012',
    (SELECT id FROM category_map WHERE slug = 'home-living'),
    ARRAY[
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/plant-pot-ceramic-set-1.svg',
      'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/plant-pot-ceramic-set-2.svg'
    ],
    'https://tsaxbsvuyjmhgarsdtnj.supabase.co/storage/v1/object/public/product-images/products/plant-pot-ceramic-set-thumb.svg',
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
