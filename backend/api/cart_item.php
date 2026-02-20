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

// Get order item ID from URL
$order_item_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($order_item_id === 0) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Order item ID is required."
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

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'PUT':
            // Update order item
            $data = json_decode(file_get_contents("php://input"));
            
            // Verify ownership
            $query = "SELECT oi.id, oi.order_id, oi.menu_item_id, mi.price 
                      FROM order_items oi 
                      JOIN orders o ON oi.order_id = o.id 
                      JOIN menu_items mi ON oi.menu_item_id = mi.id
                      WHERE oi.id = :id AND o.user_id = :user_id AND o.status = 'cart'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $order_item_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Order item not found or cannot be modified."
                ));
                exit();
            }
            
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Update quantity if provided
            if (isset($data->quantity)) {
                $new_total = $item['price'] * $data->quantity;
                
                $query = "UPDATE order_items SET quantity = :quantity, total_price = :total_price WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':quantity', $data->quantity);
                $stmt->bindParam(':total_price', $new_total);
                $stmt->bindParam(':id', $order_item_id);
                $stmt->execute();
            }
            
            // Update customizations if provided
            if (isset($data->customizations)) {
                $customizations = json_encode($data->customizations);
                $query = "UPDATE order_items SET customizations = :customizations WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':customizations', $customizations);
                $stmt->bindParam(':id', $order_item_id);
                $stmt->execute();
            }
            
            // Update special instructions if provided
            if (isset($data->special_instructions)) {
                $query = "UPDATE order_items SET special_instructions = :special_instructions WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':special_instructions', $data->special_instructions);
                $stmt->bindParam(':id', $order_item_id);
                $stmt->execute();
            }
            
            // Update order totals
            $query = "UPDATE orders o 
                      SET o.subtotal = (SELECT SUM(total_price) FROM order_items WHERE order_id = :order_id),
                          o.tax_amount = (SELECT SUM(total_price) * 0.05 FROM order_items WHERE order_id = :order_id),
                          o.total_amount = (SELECT SUM(total_price) * 1.05 FROM order_items WHERE order_id = :order_id)
                      WHERE o.id = :order_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':order_id', $item['order_id']);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Order item updated successfully."
            ));
            break;

        case 'DELETE':
            // Delete order item
            // Verify ownership
            $query = "SELECT oi.id, oi.order_id 
                      FROM order_items oi 
                      JOIN orders o ON oi.order_id = o.id 
                      WHERE oi.id = :id AND o.user_id = :user_id AND o.status = 'cart'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $order_item_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Order item not found or cannot be deleted."
                ));
                exit();
            }
            
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Delete the item
            $query = "DELETE FROM order_items WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $order_item_id);
            $stmt->execute();
            
            // Update order totals
            $query = "UPDATE orders o 
                      SET o.subtotal = (SELECT COALESCE(SUM(total_price), 0) FROM order_items WHERE order_id = :order_id),
                          o.tax_amount = (SELECT COALESCE(SUM(total_price), 0) * 0.05 FROM order_items WHERE order_id = :order_id),
                          o.total_amount = (SELECT COALESCE(SUM(total_price), 0) * 1.05 FROM order_items WHERE order_id = :order_id)
                      WHERE o.id = :order_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':order_id', $item['order_id']);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Item removed from cart."
            ));
            break;

        default:
            http_response_code(405);
            echo json_encode(array(
                "success" => false,
                "message" => "Method not allowed."
            ));
            break;
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>

