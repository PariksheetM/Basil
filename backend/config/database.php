<?php
// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception(".env file not found at: " . $path);
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
$corsOrigin = getenv('CORS_ORIGIN') ?: (getenv('FRONTEND_URL') ?: 'http://localhost:5173');
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
    private $driver;
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $sslmode;
    public $conn;

    public function __construct() {
        $this->driver = getenv('DB_DRIVER') ?: 'mysql';
        $this->host = $this->normalizeHost(getenv('DB_HOST') ?: 'localhost');
        $this->db_name = getenv('DB_NAME') ?: 'food_ordering_db';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: '';
        $this->sslmode = getenv('DB_SSLMODE') ?: 'require';
        $this->port = getenv('DB_PORT');

        // Supabase uses Postgres with SSL; auto-detect if host points to Supabase
        if ($this->driver === 'mysql' && $this->looksLikeSupabase($this->host)) {
            $this->driver = 'pgsql';
        }

        if (!$this->port) {
            $this->port = $this->driver === 'pgsql' ? 5432 : 3306;
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = $this->buildDsn();
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }

    private function buildDsn() {
        if ($this->driver === 'pgsql') {
            $ssl = $this->sslmode ? ";sslmode=" . $this->sslmode : '';
            return "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . $ssl;
        }

        // Default MySQL DSN
        return "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
    }

    private function normalizeHost($host) {
        $host = trim($host);
        if (stripos($host, 'http://') === 0 || stripos($host, 'https://') === 0) {
            $parts = parse_url($host);
            if ($parts && isset($parts['host'])) {
                return $parts['host'];
            }
        }
        return $host;
    }

    private function looksLikeSupabase($host) {
        return stripos($host, 'supabase.co') !== false;
    }
}
?>
