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

// Get session token from header
$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (empty($session_token)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Session token required."
    ));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Delete session
    $query = "DELETE FROM user_sessions WHERE session_token = :session_token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":session_token", $session_token);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Logged out successfully."
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to logout."
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

