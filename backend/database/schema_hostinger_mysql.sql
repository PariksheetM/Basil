-- ============================================================
--  FOODDASH – Complete MySQL Schema for Hostinger
--  Run this in Hostinger > phpMyAdmin on your MySQL database
--  Database: (create one via Hostinger hPanel > Databases first)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Drop tables in reverse FK order (clean slate) ──────────
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `meal_plans`;
DROP TABLE IF EXISTS `occasions`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `menu_categories`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `users`;

-- ─── users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`           INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `full_name`    VARCHAR(100)     NOT NULL,
  `email`        VARCHAR(100)     NOT NULL,
  `password`     VARCHAR(255)     NOT NULL,
  `phone`        VARCHAR(20)      DEFAULT NULL,
  `address`      TEXT             DEFAULT NULL,
  `role`         VARCHAR(20)      NOT NULL DEFAULT 'user',
  `created_at`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── user_sessions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`        INT UNSIGNED  NOT NULL,
  `session_token`  VARCHAR(255)  NOT NULL,
  `expires_at`     DATETIME      NOT NULL,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_token` (`session_token`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── menu_categories ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `menu_categories` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100)  NOT NULL,
  `description`   TEXT          DEFAULT NULL,
  `image_url`     VARCHAR(255)  DEFAULT NULL,
  `display_order` INT           NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── menu_items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id`               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `category_id`      INT UNSIGNED   NOT NULL,
  `name`             VARCHAR(100)   NOT NULL,
  `description`      TEXT           DEFAULT NULL,
  `price`            DECIMAL(10,2)  NOT NULL,
  `image_url`        VARCHAR(255)   DEFAULT NULL,
  `is_available`     TINYINT(1)     NOT NULL DEFAULT 1,
  `is_vegetarian`    TINYINT(1)     NOT NULL DEFAULT 0,
  `is_vegan`         TINYINT(1)     NOT NULL DEFAULT 0,
  `spice_level`      ENUM('none','mild','medium','hot','extra_hot') NOT NULL DEFAULT 'none',
  `calories`         INT            DEFAULT NULL,
  `preparation_time` INT            DEFAULT NULL COMMENT 'minutes',
  `display_order`    INT            NOT NULL DEFAULT 0,
  `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_available` (`is_available`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── occasions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `occasions` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)  NOT NULL,
  `description` TEXT          DEFAULT NULL,
  `is_active`   TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_occasion_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── meal_plans ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `meal_plans` (
  `id`            INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(200)   NOT NULL,
  `occasion`      VARCHAR(100)   NOT NULL,
  `price`         DECIMAL(10,2)  NOT NULL,
  `type`          VARCHAR(20)    NOT NULL DEFAULT 'veg',
  `items`         LONGTEXT       NOT NULL COMMENT 'JSON array of item categories',
  `image_url`     VARCHAR(255)   DEFAULT NULL,
  `cuisine`       VARCHAR(100)   DEFAULT 'Multi-cuisine',
  `recommended`   TINYINT(1)     NOT NULL DEFAULT 0,
  `popular`       TINYINT(1)     NOT NULL DEFAULT 0,
  `display_order` INT            NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_occasion` (`occasion`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`                      INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `user_id`                 INT UNSIGNED   NOT NULL,
  `order_number`            VARCHAR(50)    NOT NULL,
  `total_amount`            DECIMAL(10,2)  NOT NULL,
  `subtotal`                DECIMAL(10,2)  NOT NULL,
  `tax_amount`              DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `delivery_fee`            DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `discount_amount`         DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `service_retainer`        DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `status`                  VARCHAR(30)    NOT NULL DEFAULT 'cart',
  `payment_status`          VARCHAR(20)    NOT NULL DEFAULT 'pending',
  `payment_method`          VARCHAR(50)    DEFAULT NULL,
  `delivery_address`        TEXT           DEFAULT NULL,
  `delivery_phone`          VARCHAR(20)    DEFAULT NULL,
  `delivery_instructions`   TEXT           DEFAULT NULL,
  `estimated_delivery_time` DATETIME       DEFAULT NULL,
  `occasion`                VARCHAR(100)   DEFAULT NULL,
  `meal_plan_name`          VARCHAR(200)   DEFAULT NULL,
  `guest_count`             INT            NOT NULL DEFAULT 1,
  `event_date`              DATE           DEFAULT NULL,
  `event_time`              TIME           DEFAULT NULL,
  `contact_name`            VARCHAR(200)   DEFAULT NULL,
  `notes`                   LONGTEXT       DEFAULT NULL COMMENT 'JSON: contactInfo, items, selections etc.',
  `created_at`              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── order_items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`                    INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `order_id`              INT UNSIGNED   NOT NULL,
  `menu_item_id`          INT UNSIGNED   NOT NULL,
  `quantity`              INT            NOT NULL DEFAULT 1,
  `unit_price`            DECIMAL(10,2)  NOT NULL,
  `total_price`           DECIMAL(10,2)  NOT NULL,
  `customizations`        TEXT           DEFAULT NULL COMMENT 'JSON',
  `special_instructions`  TEXT           DEFAULT NULL,
  `created_at`            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_menu_item` (`menu_item_id`),
  CONSTRAINT `fk_order_items_order`     FOREIGN KEY (`order_id`)     REFERENCES `orders` (`id`)     ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  SEED DATA
-- ============================================================

-- Menu categories
INSERT IGNORE INTO `menu_categories` (`id`, `name`, `description`, `image_url`, `display_order`) VALUES
(1, 'Meal Box',  'Complete meal boxes with variety of dishes', '/meal-box.jpg',  1),
(2, 'Snack Box', 'Delicious snacks and appetizers',           '/snack-box.jpg', 2),
(3, 'Bowls',     'Customizable rice and noodle bowls',        '/bowls.jpg',     3),
(4, 'Buffet',    'All-you-can-eat buffet options',            '/buffet.jpg',    4);

-- Menu items
INSERT IGNORE INTO `menu_items` (`id`, `category_id`, `name`, `description`, `price`, `is_vegetarian`, `is_vegan`, `spice_level`, `calories`) VALUES
(1,  1, 'Classic Meal Box',        'Rice, Dal, Vegetables, Roti, Salad',                      150.00, 1, 0, 'mild',   650),
(2,  1, 'Deluxe Meal Box',         'Rice, Dal, Paneer, Vegetables, Roti, Salad, Dessert',     200.00, 1, 0, 'medium', 850),
(3,  1, 'Non-Veg Meal Box',        'Rice, Dal, Chicken Curry, Vegetables, Roti, Salad',       250.00, 0, 0, 'medium', 900),
(4,  1, 'Premium Meal Box',        'Biryani, Curry, Raita, Salad, Dessert',                   300.00, 0, 0, 'hot',    1000),
(5,  2, 'Samosa Box (6 pcs)',      'Crispy vegetable samosas with chutney',                    80.00, 1, 1, 'mild',   450),
(6,  2, 'Spring Roll Box (8 pcs)', 'Mixed vegetable spring rolls',                            100.00, 1, 1, 'mild',   400),
(7,  2, 'Pakora Mix Box',          'Assorted pakoras with mint chutney',                       90.00, 1, 1, 'medium', 380),
(8,  2, 'Chicken Wings Box',       'Spicy chicken wings with dip',                            180.00, 0, 0, 'hot',    550),
(9,  3, 'Veg Fried Rice Bowl',     'Mixed vegetables with fried rice',                        120.00, 1, 1, 'mild',   500),
(10, 3, 'Chicken Fried Rice Bowl', 'Chicken with fried rice and vegetables',                  160.00, 0, 0, 'medium', 650),
(11, 3, 'Paneer Tikka Bowl',       'Paneer tikka with rice and curry',                        140.00, 1, 0, 'medium', 600),
(12, 3, 'Noodle Bowl',             'Stir-fried noodles with vegetables',                      130.00, 1, 1, 'mild',   480),
(13, 4, 'Veg Buffet',              'Unlimited vegetarian dishes',                             350.00, 1, 0, 'mild',   1200),
(14, 4, 'Non-Veg Buffet',          'Unlimited veg and non-veg dishes',                        450.00, 0, 0, 'medium', 1500),
(15, 4, 'Premium Buffet',          'Unlimited premium dishes with live counter',              600.00, 0, 0, 'medium', 1800);

-- Occasions
INSERT IGNORE INTO `occasions` (`name`, `description`) VALUES
('Corporate Event', 'Corporate lunches, team dinners and conferences'),
('Wedding',         'Wedding feasts and receptions'),
('Birthday Party',  'Birthday celebrations for all ages'),
('House Party',     'Casual home parties and get-togethers'),
('Pooja/Religious', 'Pooja ceremonies and religious gatherings');

-- Meal plans
INSERT IGNORE INTO `meal_plans` (`id`, `name`, `occasion`, `price`, `type`, `items`, `image_url`, `cuisine`, `recommended`, `popular`) VALUES
(1,  'Premium Corporate Lunch',  'Corporate Event', 299.00, 'veg',     'Paneer Butter Masala, Dal Makhani, Jeera Rice, Garlic Naan, Raita, Gulab Jamun',         'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 'North Indian', 1, 1),
(2,  'Executive Dining Box',     'Corporate Event', 399.00, 'non-veg', 'Butter Chicken, Dal Tadka, Pulao, Butter Naan, Salad, Dessert',                           'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 'Multi-cuisine', 1, 0),
(3,  'Grand Wedding Feast',      'Wedding',         599.00, 'veg',     'Veg Biryani, Paneer Tikka, Dal Tadka, Butter Naan, Raita, Rasmalai',                      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', 'North Indian', 1, 1),
(4,  'Royal Wedding Platter',    'Wedding',         799.00, 'non-veg', 'Chicken Biryani, Mutton Korma, Paneer Tikka, Naan, Raita, Gulab Jamun',                   'https://images.unsplash.com/photo-1583850111854-6b62afd4f5e4?w=400', 'Multi-cuisine', 1, 0),
(5,  'Birthday Special Box',     'Birthday Party',  199.00, 'veg',     'Chole Bhature, Paneer Tikka, Veg Biryani, Raita, Ice Cream',                              'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400', 'Multi-cuisine', 0, 1),
(6,  'Kids Birthday Combo',      'Birthday Party',  249.00, 'veg',     'Pizza Slices, Pasta, French Fries, Nuggets, Cake, Ice Cream',                             'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400', 'Continental', 1, 0),
(7,  'House Party Deluxe',       'House Party',     299.00, 'veg',     'Pav Bhaji, Paneer Tikka, Spring Rolls, Samosas, Gulab Jamun',                             'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'Multi-cuisine', 1, 1),
(8,  'Party Mix Non-Veg',        'House Party',     399.00, 'non-veg', 'Chicken Wings, Seekh Kebab, Spring Rolls, Biryani, Dessert',                              'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', 'Multi-cuisine', 0, 0),
(9,  'Pooja Special Thali',      'Pooja/Religious', 249.00, 'veg',     'Puri, Chole, Paneer Sabzi, Rice, Kheer, Halwa',                                           'https://images.unsplash.com/photo-1546069901-c199b53894e7?w=400', 'North Indian', 1, 1),
(10, 'Festival Grand Thali',     'Pooja/Religious', 349.00, 'veg',     'Puri, Chole, Paneer, Dal, Rice, Sweets Platter, Halwa',                                   'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', 'North Indian', 1, 0);

-- Admin user (password: Admin@123 → bcrypt hash)
-- IMPORTANT: Change this password immediately after first login via the admin panel
INSERT IGNORE INTO `users` (`full_name`, `email`, `password`, `role`) VALUES
('Head Administrator', 'admin@fooddash.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- Default password is: password  ← change this immediately!
