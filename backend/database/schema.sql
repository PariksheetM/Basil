-- Create database
CREATE DATABASE IF NOT EXISTS food_ordering_db;
USE food_ordering_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sessions table (for tracking logged in users)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menu Categories table
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    spice_level ENUM('none', 'mild', 'medium', 'hot', 'extra_hot') DEFAULT 'none',
    calories INT,
    preparation_time INT, -- in minutes
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    status ENUM('cart', 'pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') DEFAULT 'cart',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    delivery_instructions TEXT,
    estimated_delivery_time DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    customizations JSON,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_menu_item (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample menu categories
INSERT INTO menu_categories (name, description, image_url, display_order) VALUES
('Meal Box', 'Complete meal boxes with variety of dishes', '/meal-box.jpg', 1),
('Snack Box', 'Delicious snacks and appetizers', '/snack-box.jpg', 2),
('Bowls', 'Customizable rice and noodle bowls', '/bowls.jpg', 3),
('Buffet', 'All-you-can-eat buffet options', '/buffet.jpg', 4);

-- Insert sample menu items
INSERT INTO menu_items (category_id, name, description, price, is_vegetarian, is_vegan, spice_level, calories) VALUES
-- Meal Box items
(1, 'Classic Meal Box', 'Rice, Dal, Vegetables, Roti, Salad', 150.00, TRUE, FALSE, 'mild', 650),
(1, 'Deluxe Meal Box', 'Rice, Dal, Paneer, Vegetables, Roti, Salad, Dessert', 200.00, TRUE, FALSE, 'medium', 850),
(1, 'Non-Veg Meal Box', 'Rice, Dal, Chicken Curry, Vegetables, Roti, Salad', 250.00, FALSE, FALSE, 'medium', 900),
(1, 'Premium Meal Box', 'Biryani, Curry, Raita, Salad, Dessert', 300.00, FALSE, FALSE, 'hot', 1000),

-- Snack Box items
(2, 'Samosa Box (6 pcs)', 'Crispy vegetable samosas with chutney', 80.00, TRUE, TRUE, 'mild', 450),
(2, 'Spring Roll Box (8 pcs)', 'Mixed vegetable spring rolls', 100.00, TRUE, TRUE, 'mild', 400),
(2, 'Pakora Mix Box', 'Assorted pakoras with mint chutney', 90.00, TRUE, TRUE, 'medium', 380),
(2, 'Chicken Wings Box', 'Spicy chicken wings with dip', 180.00, FALSE, FALSE, 'hot', 550),

-- Bowl items
(3, 'Veg Fried Rice Bowl', 'Mixed vegetables with fried rice', 120.00, TRUE, TRUE, 'mild', 500),
(3, 'Chicken Fried Rice Bowl', 'Chicken with fried rice and vegetables', 160.00, FALSE, FALSE, 'medium', 650),
(3, 'Paneer Tikka Bowl', 'Paneer tikka with rice and curry', 140.00, TRUE, FALSE, 'medium', 600),
(3, 'Noodle Bowl', 'Stir-fried noodles with vegetables', 130.00, TRUE, TRUE, 'mild', 480),

-- Buffet items
(4, 'Veg Buffet', 'Unlimited vegetarian dishes', 350.00, TRUE, FALSE, 'mild', 1200),
(4, 'Non-Veg Buffet', 'Unlimited veg and non-veg dishes', 450.00, FALSE, FALSE, 'medium', 1500),
(4, 'Premium Buffet', 'Unlimited premium dishes with live counter', 600.00, FALSE, FALSE, 'medium', 1800);
