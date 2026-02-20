-- Additional schema for Admin Panel features

-- Meal Plans table (for occasion-based catering)
CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    occasion VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) DEFAULT 'veg',
    items TEXT NOT NULL,
    image_url VARCHAR(255),
    recommended INTEGER DEFAULT 0,
    popular INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_occasion ON meal_plans(occasion);
CREATE INDEX IF NOT EXISTS idx_active ON meal_plans(is_active);

-- Update orders table to include occasion-based fields
-- Add columns if they don't exist
ALTER TABLE orders ADD COLUMN occasion VARCHAR(50);
ALTER TABLE orders ADD COLUMN meal_plan_name VARCHAR(200);
ALTER TABLE orders ADD COLUMN guest_count INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN event_date DATE;
ALTER TABLE orders ADD COLUMN event_time TIME;

-- Insert sample meal plans
INSERT OR IGNORE INTO meal_plans (id, name, occasion, price, type, items, image_url, recommended, popular) VALUES
(1, 'Premium Corporate Lunch', 'corporate', 299.00, 'veg', 
 'Paneer Butter Masala, Dal Makhani, Jeera Rice, Garlic Naan, Raita, Gulab Jamun', 
 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 1, 1),

(2, 'Executive Dining Box', 'corporate', 399.00, 'non-veg',
 'Butter Chicken, Dal Tadka, Pulao, Butter Naan, Salad, Dessert',
 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 1, 0),

(3, 'Grand Wedding Feast', 'wedding', 599.00, 'veg',
 'Veg Biryani, Paneer Tikka, Dal Tadka, Butter Naan, Raita, Rasmalai',
 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', 1, 1),

(4, 'Royal Wedding Platter', 'wedding', 799.00, 'non-veg',
 'Chicken Biryani, Mutton Korma, Paneer Tikka, Naan, Raita, Gulab Jamun',
 'https://images.unsplash.com/photo-1583850111854-6b62afd4f5e4?w=400', 1, 0),

(5, 'Birthday Special Box', 'birthday', 199.00, 'veg',
 'Chole Bhature, Paneer Tikka, Veg Biryani, Raita, Ice Cream',
 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400', 0, 1),

(6, 'Kids Birthday Combo', 'birthday', 249.00, 'veg',
 'Pizza Slices, Pasta, French Fries, Nuggets, Cake, Ice Cream',
 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400', 1, 0),

(7, 'House Party Deluxe', 'houseParty', 299.00, 'veg',
 'Pav Bhaji, Paneer Tikka, Spring Rolls, Samosas, Gulab Jamun',
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 1, 1),

(8, 'Party Mix Non-Veg', 'houseParty', 399.00, 'non-veg',
 'Chicken Wings, Seekh Kebab, Spring Rolls, Biryani, Dessert',
 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', 0, 0),

(9, 'Pooja Special Thali', 'pooja', 249.00, 'veg',
 'Puri, Chole, Paneer Sabzi, Rice, Kheer, Halwa',
 'https://images.unsplash.com/photo-1546069901-c199b53894e7?w=400', 1, 1),

(10, 'Festival Grand Thali', 'pooja', 349.00, 'veg',
 'Puri, Chole, Paneer, Dal, Rice, Sweets Platter, Halwa',
 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', 1, 0);

-- Insert sample orders for admin panel
INSERT OR IGNORE INTO orders (id, user_id, order_number, occasion, meal_plan_name, guest_count, 
 event_date, event_time, total_amount, subtotal, tax_amount, delivery_fee, 
 status, delivery_address, delivery_phone, created_at) VALUES

(1, 1, 'ORD-1234', 'Corporate Event', 'Premium Corporate Lunch', 100,
 '2026-02-10', '12:00:00', 35900, 29900, 1495, 50, 'Confirmed',
 '123 Corporate Blvd, Tech Park, Mumbai', '+91 98765 43210', '2026-02-05 10:30:00'),

(2, 1, 'ORD-1233', 'Wedding', 'Grand Wedding Feast', 500,
 '2026-02-15', '19:00:00', 349500, 299500, 14975, 50, 'Pending',
 'Grand Palace, Wedding Hall, Andheri, Mumbai', '+91 91234 56789', '2026-02-04 15:20:00'),

(3, 1, 'ORD-1232', 'Birthday Party', 'Birthday Special Box', 50,
 '2026-02-09', '18:00:00', 9950, 9950, 497, 50, 'Delivered',
 '45 Green Park, Bandra West, Mumbai', '+91 98888 12345', '2026-02-03 09:15:00'),

(4, 1, 'ORD-1231', 'Corporate Event', 'Executive Dining Box', 75,
 '2026-02-12', '13:00:00', 42000, 29925, 1496, 50, 'Confirmed',
 '456 Business Park, Powai, Mumbai', '+91 98765 43210', '2026-02-02 11:45:00'),

(5, 1, 'ORD-1230', 'House Party', 'House Party Deluxe', 30,
 '2026-02-08', '20:00:00', 10470, 8970, 448, 50, 'Delivered',
 '789 Residential Complex, Andheri, Mumbai', '+91 97777 88888', '2026-02-01 16:30:00');
