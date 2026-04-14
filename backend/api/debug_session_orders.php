<?php
require_once '../config/database_sqlite.php';

// CORS: allow local dev and deployed frontend
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
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

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Get session token
$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

$debug = [
    'headers_received' => $headers,
    'session_token_extracted' => $session_token,
    'token_length' => strlen($session_token),
];

if (empty($session_token)) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Authentication required.",
        "debug" => $debug
    ));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Debug: Check if session exists
    $testQuery = "SELECT * FROM user_sessions WHERE session_token = :session_token LIMIT 1";
    $testStmt = $db->prepare($testQuery);
    $testStmt->bindParam(':session_token', $session_token);
    $testStmt->execute();
    $testSession = $testStmt->fetch(PDO::FETCH_ASSOC);
    
    $debug['session_found'] = (bool)$testSession;
    $debug['session_data'] = $testSession;

    // Verify session
    $query = "SELECT user_id FROM user_sessions WHERE session_token = :session_token AND expires_at > datetime('now')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":session_token", $session_token);
    $stmt->execute();

    $debug['valid_session_found'] = $stmt->rowCount() > 0;

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid or expired session.",
            "debug" => $debug
        ));
        exit();
    }

    echo json_encode(array(
        "success" => true,
        "message" => "Session is valid!",
        "debug" => $debug
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage(),
        "debug" => $debug
    ));
}
?>
