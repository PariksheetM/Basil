<?php
// Admin: Dish Management API
// GET    /api/admin/dishes.php              – list all dishes
// POST   /api/admin/dishes.php              – create dish
// PUT    /api/admin/dishes.php              – update dish
// DELETE /api/admin/dishes.php              – delete dish

$allowedOrigins = [
    'http://localhost:5173',
    'https://basil-five.vercel.app',
    'https://qsr.catalystsolutions.eco',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit(); }

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $h = [];
        foreach ($_SERVER as $k => $v) {
            if (strpos($k, 'HTTP_') === 0) {
                $h[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($k, 5)))))] = $v;
            }
        }
        return $h;
    }
}

// ── Auth helper ──────────────────────────────────────────────────────────────
function requireAdmin(PDO $db): int {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token   = trim(str_ireplace('Bearer', '', $auth));
    if (!$token) { http_response_code(401); echo json_encode(['success'=>false,'message'=>'No token']); exit(); }

    $stmt = $db->prepare(
        "SELECT u.id, u.role FROM user_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.session_token = :t AND s.expires_at > DATETIME('now')"
    );
    $stmt->execute([':t' => $token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || ($row['role'] ?? '') !== 'admin') {
        http_response_code(403); echo json_encode(['success'=>false,'message'=>'Admin only']); exit();
    }
    return (int)$row['id'];
}

// ── Validation ───────────────────────────────────────────────────────────────
function validateDish(array $d): array {
    $errors = [];
    if (empty(trim($d['name'] ?? '')))    $errors[] = 'Dish name is required.';
    if (empty(trim($d['category'] ?? ''))) $errors[] = 'Category is required.';
    return $errors;
}

require_once __DIR__ . '/../../config/database_sqlite.php';
$database = new Database();
$db       = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    requireAdmin($db);

    // Ensure type column exists
    $cols = array_column($db->query("PRAGMA table_info(dishes)")->fetchAll(PDO::FETCH_ASSOC), 'name');
    if (!in_array('type', $cols, true)) {
        $db->exec("ALTER TABLE dishes ADD COLUMN type TEXT DEFAULT 'veg'");
    }

    switch ($method) {
        // ── LIST ──────────────────────────────────────────────────────────────
        case 'GET':
            $search   = trim($_GET['search'] ?? '');
            $category = trim($_GET['category'] ?? '');
            $sql      = "SELECT id, name, category, description, is_active, image, type, created_at
                         FROM dishes WHERE 1=1";
            $params = [];
            if ($search) {
                $sql .= " AND (name LIKE :s OR category LIKE :s2)";
                $params[':s'] = $params[':s2'] = "%$search%";
            }
            if ($category) {
                $sql .= " AND category = :cat";
                $params[':cat'] = $category;
            }
            $sql .= " ORDER BY category, name";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Cast types
            $rows = array_map(function($r) {
                return array_merge($r, [
                    'id'        => (int)$r['id'],
                    'is_active' => (bool)$r['is_active'],
                    'type'      => $r['type'] ?? 'veg',
                ]);
            }, $rows);

            // Also return distinct categories for filter dropdown
            $cats = $db->query("SELECT DISTINCT category FROM dishes ORDER BY category")->fetchAll(PDO::FETCH_COLUMN);

            echo json_encode(['success'=>true, 'data'=>$rows, 'categories'=>$cats]);
            break;

        // ── CREATE ────────────────────────────────────────────────────────────
        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $errs = validateDish($body);
            if ($errs) {
                http_response_code(422);
                echo json_encode(['success'=>false, 'message'=>implode(' ', $errs)]);
                break;
            }
            $stmt = $db->prepare(
                "INSERT INTO dishes (name, category, description, is_active, image, type)
                 VALUES (:name, :cat, :desc, :active, :image, :type)"
            );
            $stmt->execute([
                ':name'   => trim($body['name']),
                ':cat'    => trim($body['category']),
                ':desc'   => trim($body['description'] ?? ''),
                ':active' => isset($body['is_active']) ? (int)$body['is_active'] : 1,
                ':image'  => $body['image'] ?? '',
                ':type'   => in_array($body['type'] ?? '', ['veg','non-veg']) ? $body['type'] : 'veg',
            ]);
            $id = (int)$db->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'Dish created.',
                'data'    => [
                    'id'          => $id,
                    'name'        => trim($body['name']),
                    'category'    => trim($body['category']),
                    'description' => trim($body['description'] ?? ''),
                    'is_active'   => true,
                    'image'       => $body['image'] ?? '',
                    'type'        => in_array($body['type'] ?? '', ['veg','non-veg']) ? $body['type'] : 'veg',
                ],
            ]);
            break;

        // ── UPDATE ────────────────────────────────────────────────────────────
        case 'PUT':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $id   = (int)($body['id'] ?? 0);
            if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id required']); break; }

            $errs = validateDish($body);
            if ($errs) { http_response_code(422); echo json_encode(['success'=>false,'message'=>implode(' ',$errs)]); break; }

            $stmt = $db->prepare(
                "UPDATE dishes SET name=:name, category=:cat, description=:desc,
                                   is_active=:active, image=:image, type=:type, updated_at=DATETIME('now')
                 WHERE id=:id"
            );
            $stmt->execute([
                ':name'   => trim($body['name']),
                ':cat'    => trim($body['category']),
                ':desc'   => trim($body['description'] ?? ''),
                ':active' => isset($body['is_active']) ? (int)$body['is_active'] : 1,
                ':image'  => $body['image'] ?? '',
                ':type'   => in_array($body['type'] ?? '', ['veg','non-veg']) ? $body['type'] : 'veg',
                ':id'     => $id,
            ]);
            echo json_encode(['success'=>true,'message'=>'Dish updated.']);
            break;

        // ── DELETE ────────────────────────────────────────────────────────────
        case 'DELETE':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $id   = (int)($body['id'] ?? 0);
            if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id required']); break; }

            $db->prepare("DELETE FROM dishes WHERE id=:id")->execute([':id' => $id]);
            echo json_encode(['success'=>true,'message'=>'Dish deleted.']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success'=>false,'message'=>'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Database error: '.$e->getMessage()]);
}
?>
