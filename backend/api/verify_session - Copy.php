<?php
require_once '../config/database_sqlite.php';

// CORS: allow local dev and deployed frontend
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

// Handle preflight requests early
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Get session token from header or query parameter
$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (empty($session_token) && isset($_GET['token'])) {
    $session_token = $_GET['token'];
}

if (empty($session_token)) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Session token required."
    ));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

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

    // Check if session is valid and not expired
    $query = "SELECT us.user_id, u.full_name, u.email, u.role 
              FROM user_sessions us 
              JOIN users u ON us.user_id = u.id 
              WHERE us.session_token = :session_token 
              AND us.expires_at > datetime('now')";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":session_token", $session_token);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Session valid.",
            "data" => array(
                "user_id" => $row['user_id'],
                "full_name" => $row['full_name'],
                "email" => $row['email'],
                "role" => $row['role'] ?? 'user'
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid or expired session."
        ));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>

