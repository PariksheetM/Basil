<?php
// Adds role column to users table and seeds a default admin if missing
$dbPath = __DIR__ . '/food_ordering.db';

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Add role column if it does not exist
    $hasRole = false;
    $cols = $db->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        if (isset($col['name']) && $col['name'] === 'role') {
            $hasRole = true;
            break;
        }
    }
    if (!$hasRole) {
        $db->exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    }

    // Seed default admin if none exists
    $check = $db->query("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'")->fetch(PDO::FETCH_ASSOC);
    if (($check['cnt'] ?? 0) == 0) {
        $stmt = $db->prepare("INSERT INTO users (full_name, email, password, role) VALUES (:name, :email, :password, 'admin')");
        $stmt->execute([
            ':name' => 'Admin User',
            ':email' => 'admin@local.test',
            ':password' => password_hash('Admin@123', PASSWORD_BCRYPT)
        ]);
        echo "Seeded default admin: admin@local.test / Admin@123\n";
    } else {
        echo "Admin account already exists.\n";
    }

    echo "Role patch applied.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit(1);
}
