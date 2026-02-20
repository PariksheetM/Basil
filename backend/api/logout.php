<?php
require_once '../config/database_sqlite.php';

header('Content-Type: application/json');

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

