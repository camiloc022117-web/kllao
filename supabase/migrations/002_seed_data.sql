-- ============================================
-- Seed Data - K'lliao v2
-- ============================================

-- Categories
INSERT INTO product_categories (name) VALUES
  ('slushies'),
  ('snacks'),
  ('drinks'),
  ('extras')
ON CONFLICT (name) DO NOTHING;

-- Sizes
INSERT INTO product_sizes (name) VALUES
  ('10oz'),
  ('16oz'),
  ('20oz'),
  ('32oz'),
  ('Litro')
ON CONFLICT (name) DO NOTHING;

-- Products
INSERT INTO products (name, description, category_id, base_price, current_stock) VALUES
  ('Slush', 'Granizado', 1, 0, 0),
  ('DeTodito', 'Paquete de snacks', 2, 2500, 50),
  ('Doritos', 'Doritos nacho', 2, 3000, 40),
  ('Choclitos', 'Palomitas de maíz', 2, 2500, 35),
  ('Aguila Light', 'Cerveza Águila Light 330ml', 3, 3500, 48),
  ('Pilsen', 'Cerveza Pilsen 330ml', 3, 3000, 48),
  ('Water bottle', 'Agua botella 600ml', 3, 2000, 30),
  ('Syringe', 'Jeringa de gummy', 4, 1500, 25),
  ('Watermelon tape', 'Cinta de sandía', 4, 1500, 20),
  ('Gummy', 'Gomita surtida', 4, 1000, 30),
  ('Red Lips', 'Labios rojos', 4, 1000, 20)
ON CONFLICT DO NOTHING;

-- Variants (Slush)
INSERT INTO product_variants (product_id, size_id, has_liquor, price) VALUES
  (1, 1, false, 3000),
  (1, 1, true, 5000),
  (1, 2, false, 4000),
  (1, 2, true, 6000),
  (1, 3, false, 5000),
  (1, 3, true, 7000),
  (1, 4, false, 7000),
  (1, 4, true, 9000),
  (1, 5, false, 10000),
  (1, 5, true, 12000)
ON CONFLICT (product_id, size_id, has_liquor) DO NOTHING;
