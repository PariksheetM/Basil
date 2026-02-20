<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

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

    // Ensure meal_plans exists even if admin schema was not applied
    $db->exec("CREATE TABLE IF NOT EXISTS meal_plans (
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
    
    // Simple admin gate based on session token; GET is allowed publicly
    $headers = getallheaders();
    $sessionToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    $isPublicGet = $method === 'GET';

    $adminUser = null;
    if (!$isPublicGet) {
        if (!$sessionToken) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authorization required']);
            exit;
        }

        // Ensure role column exists
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

    $normalizeItemsOut = function ($rawItems) {
        if (empty($rawItems)) {
            return [];
        }

        // Structured JSON: [{category: '', items:[{name, image, type, priceDelta}]}]
        $decoded = json_decode($rawItems, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Legacy comma separated string
        if (is_string($rawItems)) {
            return array_values(array_filter(array_map('trim', explode(',', $rawItems))));
        }

        return [];
    };

    $normalizeItemsIn = function ($input) {
        // Accept already structured category array or plain string/array
        if (is_array($input)) {
            return json_encode($input, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        if (is_string($input)) {
            return $input;
        }
        return '';
    };

    if ($method === 'GET') {
        // Get all meal plans
        $stmt = $db->query("SELECT * FROM meal_plans WHERE is_active = 1 ORDER BY display_order, id");
        $meals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format meals data
        $formattedMeals = array_map(function($meal) use ($normalizeItemsOut) {
            return [
                'id' => (int)$meal['id'],
                'name' => $meal['name'],
                'occasion' => $meal['occasion'],
                'price' => (float)$meal['price'],
                'type' => $meal['type'],
                'items' => $normalizeItemsOut($meal['items']),
                'image' => $meal['image_url'],
                'recommended' => (bool)$meal['recommended'],
                'popular' => (bool)$meal['popular']
            ];
        }, $meals);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $formattedMeals
        ]);
        
    } elseif ($method === 'POST') {
        // Create new meal plan
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['name']) || !isset($data['occasion']) || !isset($data['price'])) {
            throw new Exception('Name, occasion, and price are required');
        }
        
        $stmt = $db->prepare("INSERT INTO meal_plans 
                             (name, occasion, price, type, items, image_url, recommended, popular, created_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))");
        $stmt->execute([
            $data['name'],
            $data['occasion'],
            $data['price'],
            $data['type'] ?? 'veg',
            $normalizeItemsIn($data['items'] ?? ''),
            $data['image'] ?? '',
            $data['recommended'] ? 1 : 0,
            $data['popular'] ? 1 : 0
        ]);
        
        $newId = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Meal plan created successfully',
            'data' => ['id' => $newId]
        ]);
        
    } elseif ($method === 'PUT') {
        // Update meal plan
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('Meal ID is required');
        }
        
        $stmt = $db->prepare("UPDATE meal_plans SET 
                             name = ?, occasion = ?, price = ?, type = ?, items = ?, 
                             image_url = ?, recommended = ?, popular = ?, updated_at = datetime('now')
                             WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $data['occasion'],
            $data['price'],
            $data['type'],
            $normalizeItemsIn($data['items'] ?? ''),
            $data['image'] ?? '',
            $data['recommended'] ? 1 : 0,
            $data['popular'] ? 1 : 0,
            $data['id']
        ]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Meal plan updated successfully'
        ]);
        
    } elseif ($method === 'DELETE') {
        // Delete meal plan (soft delete)
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('Meal ID is required');
        }
        
        $stmt = $db->prepare("UPDATE meal_plans SET is_active = 0, updated_at = datetime('now') WHERE id = ?");
        $stmt->execute([$data['id']]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Meal plan deleted successfully'
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
