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

        return $conn;
    }

    private function createSQLiteTables($conn, $schemaFile) {
        if (file_exists($schemaFile)) {
            $conn->exec(file_get_contents($schemaFile));
        }
    }
}
?>
