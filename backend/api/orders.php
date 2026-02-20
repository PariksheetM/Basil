<?php
require_once '../config/database_sqlite.php';

header('Content-Type: application/json');

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

    // Get user's orders
    $query = "SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.subtotal,
                o.tax_amount,
                o.delivery_fee,
                o.status,
                o.payment_status,
                o.delivery_address,
                o.created_at,
                o.updated_at,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
              FROM orders o
              WHERE o.user_id = :user_id AND o.status != 'cart'
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get items for each order
    foreach ($orders as &$order) {
        $itemQuery = "SELECT 
                        oi.id,
                        oi.quantity,
                        oi.unit_price,
                        oi.total_price,
                        mi.name as item_name,
                        mi.image_url as item_image
                      FROM order_items oi
                      JOIN menu_items mi ON oi.menu_item_id = mi.id
                      WHERE oi.order_id = :order_id";
        
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->bindParam(':order_id', $order['id']);
        $itemStmt->execute();
        
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "data" => $orders
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>

