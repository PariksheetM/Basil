<?php
// Quote Request API
// POST /api/quote_request.php  – submit a price quote request (public)
// GET  /api/quote_request.php  – list all requests (admin only)

require_once '../config/database_sqlite.php';

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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

try {
    $database = new Database();
    $db = $database->getConnection();

    // Auto-create table
    $db->exec("
        CREATE TABLE IF NOT EXISTS quote_requests (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            email       TEXT,
            event_date  TEXT    NOT NULL,
            guest_count INTEGER NOT NULL,
            dishes_json TEXT    NOT NULL,
            notes       TEXT,
            status      TEXT    NOT NULL DEFAULT 'pending',
            created_at  DATETIME DEFAULT (DATETIME('now'))
        )
    ");

    switch ($_SERVER['REQUEST_METHOD']) {

        // ── SUBMIT QUOTE REQUEST (public) ─────────────────────────────────────
        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];

            $name        = trim($body['name'] ?? '');
            $phone       = trim($body['phone'] ?? '');
            $email       = trim($body['email'] ?? '');
            $eventDate   = trim($body['event_date'] ?? '');
            $guestCount  = (int)($body['guest_count'] ?? 0);
            $dishesJson  = json_encode($body['dishes'] ?? []);
            $notes       = trim($body['notes'] ?? '');

            $errors = [];
            if (!$name)       $errors[] = 'Name is required.';
            if (!$phone)      $errors[] = 'Phone number is required.';
            if (!$eventDate)  $errors[] = 'Event date is required.';
            if ($guestCount < 1) $errors[] = 'Guest count must be at least 1.';
            if (empty($body['dishes'])) $errors[] = 'Please select at least one dish.';

            if ($errors) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
                break;
            }

            $stmt = $db->prepare(
                "INSERT INTO quote_requests (name, phone, email, event_date, guest_count, dishes_json, notes)
                 VALUES (:name, :phone, :email, :event_date, :guest_count, :dishes_json, :notes)"
            );
            $stmt->execute([
                ':name'        => $name,
                ':phone'       => $phone,
                ':email'       => $email,
                ':event_date'  => $eventDate,
                ':guest_count' => $guestCount,
                ':dishes_json' => $dishesJson,
                ':notes'       => $notes,
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Your quote request has been submitted. We will contact you shortly.',
                'id'      => (int)$db->lastInsertId(),
            ]);
            break;

        // ── LIST (admin only) ─────────────────────────────────────────────────
        case 'GET':
            $headers = getallheaders();
            $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            $token   = trim(str_ireplace('Bearer', '', $auth));
            if (!$token) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'No token']);
                break;
            }
            $stmt = $db->prepare(
                "SELECT u.id, u.role FROM user_sessions s
                 JOIN users u ON u.id = s.user_id
                 WHERE s.session_token = :t AND s.expires_at > DATETIME('now')"
            );
            $stmt->execute([':t' => $token]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row || ($row['role'] ?? '') !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Admin only']);
                break;
            }

            $rows = $db->query(
                "SELECT * FROM quote_requests ORDER BY created_at DESC"
            )->fetchAll(PDO::FETCH_ASSOC);

            $rows = array_map(function ($r) {
                $r['id']          = (int)$r['id'];
                $r['guest_count'] = (int)$r['guest_count'];
                $r['dishes']      = json_decode($r['dishes_json'], true);
                return $r;
            }, $rows);

            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
