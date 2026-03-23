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

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Get session token
$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (empty($session_token)) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Authentication required."
    ));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify session
    $query = "SELECT user_id FROM user_sessions WHERE session_token = :session_token AND expires_at > datetime('now')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":session_token", $session_token);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid or expired session."
        ));
        exit();
    }

    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    $user_id = $session['user_id'];

    $data = json_decode(file_get_contents("php://input"));

    // Get the active cart
    $query = "SELECT id FROM orders WHERE user_id = :user_id AND status = 'cart' ORDER BY created_at DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "No active cart found."
        ));
        exit();
    }

    $cart = $stmt->fetch(PDO::FETCH_ASSOC);
    $order_id = $cart['id'];

    // Update order details
    $query = "UPDATE orders SET 
              delivery_address = :delivery_address,
              delivery_phone = :delivery_phone,
              delivery_instructions = :delivery_instructions,
              status = 'pending',
              payment_method = :payment_method
              WHERE id = :order_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':delivery_address', $data->delivery_address);
    $stmt->bindParam(':delivery_phone', $data->delivery_phone);
    $stmt->bindParam(':delivery_instructions', $data->delivery_instructions);
    $stmt->bindParam(':payment_method', $data->payment_method);
    $stmt->bindParam(':order_id', $order_id);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "message" => "Order placed successfully.",
        "order_id" => $order_id
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>

