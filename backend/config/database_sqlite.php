<?php
// Universal database connector.
// Reads DB_DRIVER from .env: 'sqlite' (default, local dev) or 'mysql' (Hostinger production).

function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $name  = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name]    = $value;
            $_SERVER[$name] = $value;
        }
    }
}

$envPath = dirname(__DIR__) . '/.env';
loadEnv($envPath);

// Note: CORS is handled per-endpoint.

class Database {
    public $conn;

    public function getConnection() {
        $driver = strtolower(getenv('DB_DRIVER') ?: 'sqlite');

        try {
            if ($driver === 'mysql') {
                $this->conn = $this->connectMySQL();
            } else {
                $this->conn = $this->connectSQLite();
            }
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'message' => 'DB connection error: ' . $e->getMessage()]));
        }

        return $this->conn;
    }

    // ── MySQL (Hostinger) ────────────────────────────────────────
    private function connectMySQL() {
        $host   = getenv('DB_HOST') ?: 'localhost';
        $port   = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_NAME') ?: 'fooddash';
        $user   = getenv('DB_USER') ?: 'root';
        $pass   = getenv('DB_PASS') ?: '';

        $dsn  = "mysql:host=$host;port=$port;dbname=$dbName;charset=utf8mb4";
        $opts = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ];
        return new PDO($dsn, $user, $pass, $opts);
    }

    // ── SQLite (Local / Dev) ─────────────────────────────────────
    private function connectSQLite() {
        $dbDir      = dirname(__DIR__) . '/database';
        $dbPath     = $dbDir . '/food_ordering.db';
        $schemaFile = $dbDir . '/schema_sqlite.sql';

        if (!is_dir($dbDir)) mkdir($dbDir, 0755, true);

        $dbExists = file_exists($dbPath);
        $conn = new PDO("sqlite:$dbPath");
        $conn->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        if (!$dbExists) $this->createSQLiteTables($conn, $schemaFile);

        // Ensure all dynamic tables / columns exist
        $conn->exec("CREATE TABLE IF NOT EXISTS occasions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $conn->exec("CREATE TABLE IF NOT EXISTS meal_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            occasion TEXT NOT NULL,
            price REAL NOT NULL,
            type TEXT DEFAULT 'veg',
            items TEXT NOT NULL,
            image_url TEXT,
            cuisine TEXT DEFAULT 'Multi-cuisine',
            recommended INTEGER DEFAULT 0,
            popular INTEGER DEFAULT 0,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // Patch orders table with newer columns if missing
        $existingCols = array_column(
            $conn->query("PRAGMA table_info(orders)")->fetchAll(PDO::FETCH_ASSOC), 'name'
        );
        $patch = [
            'occasion'          => "ALTER TABLE orders ADD COLUMN occasion VARCHAR(100)",
            'meal_plan_name'    => "ALTER TABLE orders ADD COLUMN meal_plan_name VARCHAR(200)",
            'guest_count'       => "ALTER TABLE orders ADD COLUMN guest_count INTEGER DEFAULT 1",
            'event_date'        => "ALTER TABLE orders ADD COLUMN event_date DATE",
            'event_time'        => "ALTER TABLE orders ADD COLUMN event_time TIME",
            'contact_name'      => "ALTER TABLE orders ADD COLUMN contact_name TEXT",
            'service_retainer'  => "ALTER TABLE orders ADD COLUMN service_retainer DECIMAL(10,2) DEFAULT 0",
            'role'              => null, // handled on users table below
        ];
        foreach ($patch as $col => $sql) {
            if ($sql && !in_array($col, $existingCols, true)) $conn->exec($sql);
        }

        // Ensure users.role exists
        $userCols = array_column(
            $conn->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC), 'name'
        );
        if (!in_array('role', $userCols, true)) {
            $conn->exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
        }

        // ── Bulk-ordering: dishes ────────────────────────────────
        // ── Dishes: migrate to nullable bulk fields if needed ──────────────
        // Check if the old schema has bulk_quantity NOT NULL and migrate
        $dishCols = $conn->query("PRAGMA table_info(dishes)")->fetchAll(PDO::FETCH_ASSOC);
        $hasBulk = count(array_filter($dishCols, fn($c) => $c['name'] === 'bulk_quantity')) > 0;
        $bulkNullable = false;
        foreach ($dishCols as $col) {
            if ($col['name'] === 'bulk_quantity' && $col['notnull'] == 0) {
                $bulkNullable = true;
            }
        }
        if ($hasBulk && !$bulkNullable) {
            // Migrate: rename old, create new without NOT NULL on bulk fields, copy, drop old
            $conn->exec("ALTER TABLE dishes RENAME TO dishes_old");
        }
        if (!$hasBulk || ($hasBulk && !$bulkNullable)) {
        $conn->exec("CREATE TABLE IF NOT EXISTS dishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            bulk_quantity REAL,
            unit TEXT DEFAULT 'kg',
            bulk_price REAL,
            serves_people INTEGER,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        }
        // Copy existing rows from old table if migration happened
        $oldExists = $conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name='dishes_old'")->fetchColumn();
        if ($oldExists) {
            $conn->exec("INSERT INTO dishes (id, name, category, bulk_quantity, unit, bulk_price, serves_people, description, is_active, created_at, updated_at)
                         SELECT id, name, category, bulk_quantity, unit, bulk_price, serves_people, description, is_active, created_at, updated_at FROM dishes_old");
            $conn->exec("DROP TABLE dishes_old");
        }
        // Add image column to dishes if not present
        $dishColNames = array_column(
            $conn->query("PRAGMA table_info(dishes)")->fetchAll(PDO::FETCH_ASSOC), 'name'
        );
        if (!in_array('image', $dishColNames, true)) {
            $conn->exec("ALTER TABLE dishes ADD COLUMN image TEXT");
        }

        // ── Bulk-ordering: bulk meal plans ───────────────────────
        $conn->exec("CREATE TABLE IF NOT EXISTS bulk_meal_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            occasion TEXT NOT NULL,
            meal_type TEXT NOT NULL DEFAULT 'lunch',
            num_people INTEGER NOT NULL,
            grand_total REAL NOT NULL DEFAULT 0,
            notes TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // ── junction: which dishes go into each bulk meal plan ───
        $conn->exec("CREATE TABLE IF NOT EXISTS bulk_meal_dishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bulk_meal_id INTEGER NOT NULL,
            dish_id INTEGER NOT NULL,
            num_people INTEGER NOT NULL,
            required_quantity REAL NOT NULL,
            total_cost REAL NOT NULL,
            FOREIGN KEY (bulk_meal_id) REFERENCES bulk_meal_plans(id) ON DELETE CASCADE,
            FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE RESTRICT
        )");

        return $conn;
    }

    private function createSQLiteTables($conn, $schemaFile) {
        if (file_exists($schemaFile)) {
            $conn->exec(file_get_contents($schemaFile));
        }
    }
}
?>
