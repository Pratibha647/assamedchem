-- DROP TABLE statements to clean up existing structures
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. TABLE: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'seller')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE: products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    base_unit VARCHAR(20) NOT NULL CHECK (base_unit IN ('g', 'mL', 'item')),
    base_price_per_unit NUMERIC(20,6) NOT NULL,
    stock_quantity NUMERIC(20,6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
    total_amount_inr NUMERIC(20,6) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: order_items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    ordered_unit VARCHAR(20) NOT NULL,
    ordered_quantity NUMERIC(20,6) NOT NULL,
    base_quantity NUMERIC(20,6) NOT NULL,
    unit_price_inr NUMERIC(20,6) NOT NULL,
    line_total_inr NUMERIC(20,6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
