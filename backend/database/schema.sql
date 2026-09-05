CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL 
);


CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    base_price REAL NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    size_id INTEGER NOT NULL,
    has_liquor INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (size_id) REFERENCES product_sizes(id)
);

CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total REAL NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS sale_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variant_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);    

CREATE TABLE IF NOT EXISTS stock_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_entry_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_entry_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    cost_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (stock_entry_id) REFERENCES stock_entries(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

