<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Provide getallheaders shim when unavailable (built-in server on Windows)
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (strpos($name, 'HTTP_') === 0) {
                $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$key] = $value;
            }
        }
        return $headers;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database_sqlite.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();

    // Ensure occasions table exists
    $db->exec("CREATE TABLE IF NOT EXISTS occasions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Admin auth (GET is public so the user site can read occasions)
    $headers = getallheaders();
    $sessionToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    $isPublicGet = $method === 'GET';
    if (!$isPublicGet && !$sessionToken) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization required']);
        exit;
    }

    // Ensure role column exists on users
    $hasRole = false;
    $cols = $db->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        if (($col['name'] ?? '') === 'role') {
            $hasRole = true;
            break;
        }
    }
    if (!$hasRole) {
        $db->exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    }

    if (!$isPublicGet) {
        $authStmt = $db->prepare("SELECT u.id, u.email, u.role FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = :token AND s.expires_at > datetime('now')");
        $authStmt->bindParam(':token', $sessionToken);
        $authStmt->execute();
        $adminUser = $authStmt->fetch(PDO::FETCH_ASSOC);

        if (!$adminUser || ($adminUser['role'] ?? 'user') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin access only']);
            exit;
        }
    }

    if ($method === 'GET') {
        $stmt = $db->query("SELECT id, name, description FROM occasions WHERE is_active = 1 ORDER BY name ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        if (empty($data['name'])) {
            throw new Exception('Occasion name is required');
        }
        $stmt = $db->prepare("INSERT INTO occasions (name, description) VALUES (:name, :description)");
        $stmt->execute([
            ':name' => trim($data['name']),
            ':description' => $data['description'] ?? ''
        ]);
        echo json_encode(['success' => true, 'message' => 'Occasion created', 'data' => ['id' => $db->lastInsertId()]]);
        exit;
    }

    if ($method === 'PUT') {
        if (empty($data['id']) || empty($data['name'])) {
            throw new Exception('Occasion id and name are required');
        }
        $stmt = $db->prepare("UPDATE occasions SET name = :name, description = :description, updated_at = datetime('now') WHERE id = :id");
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => trim($data['name']),
            ':description' => $data['description'] ?? ''
        ]);
        echo json_encode(['success' => true, 'message' => 'Occasion updated']);
        exit;
    }

    if ($method === 'DELETE') {
        if (empty($data['id'])) {
            throw new Exception('Occasion id is required');
        }
        $stmt = $db->prepare("UPDATE occasions SET is_active = 0, updated_at = datetime('now') WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);
        echo json_encode(['success' => true, 'message' => 'Occasion deleted']);
        exit;
    }

} catch (PDOException $e) {
    $errorMsg = $e->getMessage();
    if (strpos($errorMsg, 'occasions.name') !== false && strpos($errorMsg, 'UNIQUE') !== false) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Occasion already exists',
            'error' => $errorMsg
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Operation failed',
            'error' => $errorMsg
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Operation failed',
        'error' => $e->getMessage()
    ]);
}
?>
