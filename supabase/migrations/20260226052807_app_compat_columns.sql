-- Compatibility patch for existing Supabase schema
-- This migration is intentionally defensive and only alters objects that exist.

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE '
      ALTER TABLE public.orders
        ADD COLUMN IF NOT EXISTS customer_name TEXT,
        ADD COLUMN IF NOT EXISTS customer_email TEXT
    ';

    IF to_regclass('public.profiles') IS NOT NULL THEN
      EXECUTE '
        UPDATE public.orders o
        SET
          customer_name = COALESCE(o.customer_name, p.full_name, ''Guest Customer''),
          customer_email = COALESCE(o.customer_email, p.email, ''guest@example.com'')
        FROM public.profiles p
        WHERE o.user_id = p.id
          AND (o.customer_name IS NULL OR o.customer_email IS NULL)
      ';
    END IF;

    EXECUTE '
      UPDATE public.orders
      SET
        customer_name = COALESCE(customer_name, ''Guest Customer''),
        customer_email = COALESCE(customer_email, ''guest@example.com'')
      WHERE customer_name IS NULL OR customer_email IS NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.order_items') IS NOT NULL THEN
    EXECUTE '
      ALTER TABLE public.order_items
        ADD COLUMN IF NOT EXISTS product_name TEXT,
        ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS line_total DECIMAL(10, 2)
    ';

    EXECUTE '
      ALTER TABLE public.order_items
        ALTER COLUMN product_id DROP NOT NULL
    ';

    IF to_regclass('public.products') IS NOT NULL THEN
      EXECUTE '
        UPDATE public.order_items oi
        SET
          unit_price = COALESCE(oi.unit_price, oi.price),
          line_total = COALESCE(oi.line_total, oi.price * oi.quantity),
          product_name = COALESCE(oi.product_name, p.name, ''Product'')
        FROM public.products p
        WHERE oi.product_id = p.id
          AND (oi.product_name IS NULL OR oi.unit_price IS NULL OR oi.line_total IS NULL)
      ';
    END IF;

    EXECUTE '
      UPDATE public.order_items
      SET
        unit_price = COALESCE(unit_price, price),
        line_total = COALESCE(line_total, price * quantity),
        product_name = COALESCE(product_name, ''Product'')
      WHERE product_name IS NULL OR unit_price IS NULL OR line_total IS NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.order_tracking') IS NOT NULL THEN
    EXECUTE '
      ALTER TABLE public.order_tracking
        ADD COLUMN IF NOT EXISTS label TEXT,
        ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ
    ';

    EXECUTE '
      UPDATE public.order_tracking
      SET
        label = COALESCE(label, message, ''Status updated''),
        occurred_at = COALESCE(occurred_at, created_at)
      WHERE label IS NULL OR occurred_at IS NULL
    ';
  END IF;
END $$;
