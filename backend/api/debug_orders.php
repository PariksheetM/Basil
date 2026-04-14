<?php
require_once '../config/database_sqlite.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get session token from Authorization header
    $headers = getallheaders();
    $session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

    $debug = [
        'session_token' => $session_token,
        'token_received' => !empty($session_token),
    ];

    if (!empty($session_token)) {
        // Check if session exists
        $query = "SELECT * FROM user_sessions WHERE session_token = :session_token LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':session_token', $session_token);
        $stmt->execute();
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $debug['session_found'] = (bool)$session;
        $debug['session_data'] = $session;

        if ($session) {
            $user_id = $session['user_id'];
            
            // Get orders for this user
            $orderQuery = "SELECT id, order_number, total_amount, status, created_at FROM orders WHERE user_id = :user_id LIMIT 5";
            $orderStmt = $db->prepare($orderQuery);
            $orderStmt->bindParam(':user_id', $user_id);
            $orderStmt->execute();
            $orders = $orderStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $debug['user_id'] = $user_id;
            $debug['orders_count'] = count($orders);
            $debug['orders_sample'] = $orders;
        }
    }

    // Also check all sessions in database
    $allSessionsQuery = "SELECT id, user_id, session_token, created_at, expires_at FROM user_sessions LIMIT 10";
    $allSessionsStmt = $db->prepare($allSessionsQuery);
    $allSessionsStmt->execute();
    $allSessions = $allSessionsStmt->fetchAll(PDO::FETCH_ASSOC);
    $debug['all_sessions_in_db'] = $allSessions;

    // Check all orders
    $allOrdersQuery = "SELECT id, order_number, user_id, total_amount, status, created_at FROM orders LIMIT 10";
    $allOrdersStmt = $db->prepare($allOrdersQuery);
    $allOrdersStmt->execute();
    $allOrders = $allOrdersStmt->fetchAll(PDO::FETCH_ASSOC);
    $debug['sample_orders_in_db'] = $allOrders;

    echo json_encode($debug);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
