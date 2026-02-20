-- SQLite Schema
-- Create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);

-- Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_id_sessions ON user_sessions(user_id);

-- Menu Categories table
CREATE TABLE IF NOT EXISTS menu_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available INTEGER DEFAULT 1,
    is_vegetarian INTEGER DEFAULT 0,
    is_vegan INTEGER DEFAULT 0,
    spice_level VARCHAR(20) DEFAULT 'none',
    calories INTEGER,
    preparation_time INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_available ON menu_items(is_available);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'cart',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    delivery_instructions TEXT,
    estimated_delivery_time DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id_orders ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    customizations TEXT,
    special_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_item ON order_items(menu_item_id);

-- Insert sample menu categories (only if not exists)
INSERT OR IGNORE INTO menu_categories (id, name, description, image_url, display_order) VALUES
(1, 'Meal Box', 'Complete meal boxes with variety of dishes', '/meal-box.jpg', 1),
(2, 'Snack Box', 'Delicious snacks and appetizers', '/snack-box.jpg', 2),
(3, 'Bowls', 'Customizable rice and noodle bowls', '/bowls.jpg', 3),
(4, 'Buffet', 'All-you-can-eat buffet options', '/buffet.jpg', 4);

-- Insert sample menu items (only if not exists)
INSERT OR IGNORE INTO menu_items (id, category_id, name, description, price, is_vegetarian, is_vegan, spice_level, calories) VALUES
-- Meal Box items
(1, 1, 'Classic Meal Box', 'Rice, Dal, Vegetables, Roti, Salad', 150.00, 1, 0, 'mild', 650),
(2, 1, 'Deluxe Meal Box', 'Rice, Dal, Paneer, Vegetables, Roti, Salad, Dessert', 200.00, 1, 0, 'medium', 850),
(3, 1, 'Non-Veg Meal Box', 'Rice, Dal, Chicken Curry, Vegetables, Roti, Salad', 250.00, 0, 0, 'medium', 900),
(4, 1, 'Premium Meal Box', 'Biryani, Curry, Raita, Salad, Dessert', 300.00, 0, 0, 'hot', 1000),

-- Snack Box items
(5, 2, 'Samosa Box (6 pcs)', 'Crispy vegetable samosas with chutney', 80.00, 1, 1, 'mild', 450),
(6, 2, 'Spring Roll Box (8 pcs)', 'Mixed vegetable spring rolls', 100.00, 1, 1, 'mild', 400),
(7, 2, 'Pakora Mix Box', 'Assorted pakoras with mint chutney', 90.00, 1, 1, 'medium', 380),
(8, 2, 'Chicken Wings Box', 'Spicy chicken wings with dip', 180.00, 0, 0, 'hot', 550),

-- Bowl items
(9, 3, 'Veg Fried Rice Bowl', 'Mixed vegetables with fried rice', 120.00, 1, 1, 'mild', 500),
(10, 3, 'Chicken Fried Rice Bowl', 'Chicken with fried rice and vegetables', 160.00, 0, 0, 'medium', 650),
(11, 3, 'Paneer Tikka Bowl', 'Paneer tikka with rice and curry', 140.00, 1, 0, 'medium', 600),
(12, 3, 'Noodle Bowl', 'Stir-fried noodles with vegetables', 130.00, 1, 1, 'mild', 480),

-- Buffet items
(13, 4, 'Veg Buffet', 'Unlimited vegetarian dishes', 350.00, 1, 0, 'mild', 1200),
(14, 4, 'Non-Veg Buffet', 'Unlimited veg and non-veg dishes', 450.00, 0, 0, 'medium', 1500),
(15, 4, 'Premium Buffet', 'Unlimited premium dishes with live counter', 600.00, 0, 0, 'medium', 1800);
