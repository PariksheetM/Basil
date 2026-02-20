-- Quick test queries for MySQL Workbench

-- 1. Check if database was created
SHOW DATABASES LIKE 'food_ordering_db';

-- 2. Use the database
USE food_ordering_db;

-- 3. Check all tables
SHOW TABLES;

-- 4. View users table structure
DESCRIBE users;

-- 5. View all registered users
SELECT id, full_name, email, created_at FROM users;

-- 6. View active sessions
SELECT 
    us.id as session_id,
    u.full_name,
    u.email,
    us.session_token,
    us.expires_at,
    CASE 
        WHEN us.expires_at > NOW() THEN 'Active'
        ELSE 'Expired'
    END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC;

-- 7. Count total users
SELECT COUNT(*) as total_users FROM users;

-- 8. Clean up expired sessions (optional)
DELETE FROM user_sessions WHERE expires_at < NOW();

-- 9. Delete a specific user (for testing)
-- DELETE FROM users WHERE email = 'test@example.com';

-- 10. View recent signups
SELECT id, full_name, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- 11. Reset database (CAUTION: Deletes all data)
-- DROP DATABASE food_ordering_db;
-- Then run schema.sql again
