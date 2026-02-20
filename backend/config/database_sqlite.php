<?php
// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env file
$envPath = dirname(__DIR__) . '/.env';
loadEnv($envPath);

// CORS headers
$corsOrigin = getenv('CORS_ORIGIN') ?: 'http://localhost:5173';
header("Access-Control-Allow-Origin: " . $corsOrigin);
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    public $conn;

    public function getConnection() {
        $dbPath = dirname(__DIR__) . '/database/food_ordering.db';
        $schemaFile = dirname(__DIR__) . '/database/schema_sqlite.sql';
        
        try {
            // Check if database file exists
            $dbExists = file_exists($dbPath);
            
            $this->conn = new PDO("sqlite:" . $dbPath);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Only create tables if database was just created
            if (!$dbExists) {
                $this->createTables($schemaFile);
            }

            // Ensure occasions table exists (for admin-created occasions)
            $this->conn->exec("CREATE TABLE IF NOT EXISTS occasions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");

            // Ensure meal_plans table exists for occasion-specific plans
            $this->conn->exec("CREATE TABLE IF NOT EXISTS meal_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                occasion TEXT NOT NULL,
                price REAL NOT NULL,
                type TEXT DEFAULT 'veg',
                items TEXT NOT NULL,
                image_url TEXT,
                recommended INTEGER DEFAULT 0,
                popular INTEGER DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");

            // Ensure order columns exist for occasion-based fields
            $orderColumns = $this->conn->query("PRAGMA table_info(orders)")->fetchAll(PDO::FETCH_ASSOC);
            $orderColNames = array_map(fn($c) => $c['name'], $orderColumns ?: []);
            $maybeAdd = [
                'occasion' => "ALTER TABLE orders ADD COLUMN occasion VARCHAR(50)",
                'meal_plan_name' => "ALTER TABLE orders ADD COLUMN meal_plan_name VARCHAR(200)",
                'guest_count' => "ALTER TABLE orders ADD COLUMN guest_count INTEGER DEFAULT 1",
                'event_date' => "ALTER TABLE orders ADD COLUMN event_date DATE",
                'event_time' => "ALTER TABLE orders ADD COLUMN event_time TIME"
            ];
            foreach ($maybeAdd as $col => $sql) {
                if (!in_array($col, $orderColNames, true)) {
                    $this->conn->exec($sql);
                }
            }
            
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
    
    private function createTables($schemaFile) {
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            $this->conn->exec($sql);
        }
    }
}
?>
