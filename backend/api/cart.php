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

    // Verify session and get user_id
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

    // Handle different request methods
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // Get user's active cart/order
            $query = "SELECT 
                        o.id,
                        o.order_number,
                        o.total_amount,
                        o.subtotal,
                        o.tax_amount,
                        o.delivery_fee,
                        o.discount_amount,
                        o.status,
                        o.delivery_address,
                        o.delivery_phone,
                        o.delivery_instructions,
                        o.notes,
                        o.created_at,
                        o.updated_at
                      FROM orders o
                      WHERE o.user_id = :user_id AND o.status = 'cart'
                      ORDER BY o.created_at DESC
                      LIMIT 1";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "data" => null,
                    "message" => "No active cart found."
                ));
                exit();
            }
            
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get order items
            $itemQuery = "SELECT 
                            oi.id,
                            oi.menu_item_id,
                            oi.quantity,
                            oi.unit_price,
                            oi.total_price,
                            oi.customizations,
                            oi.special_instructions,
                            mi.name as item_name,
                            mi.description as item_description,
                            mi.image_url as item_image
                          FROM order_items oi
                          JOIN menu_items mi ON oi.menu_item_id = mi.id
                          WHERE oi.order_id = :order_id";
            
            $itemStmt = $db->prepare($itemQuery);
            $itemStmt->bindParam(':order_id', $order['id']);
            $itemStmt->execute();
            
            $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "data" => $order
            ));
            break;

        case 'POST':
            // Create new order or add item to cart
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->menu_item_id) || empty($data->quantity)) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Menu item ID and quantity are required."
                ));
                exit();
            }
            
            // Get menu item details
            $query = "SELECT id, name, price FROM menu_items WHERE id = :id AND is_available = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->menu_item_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Menu item not found or unavailable."
                ));
                exit();
            }
            
            $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Check if user has an active cart
            $query = "SELECT id FROM orders WHERE user_id = :user_id AND status = 'cart' ORDER BY created_at DESC LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                // Create new cart/order
                $order_number = 'ORD' . date('Ymd') . rand(1000, 9999);
                $query = "INSERT INTO orders (user_id, order_number, total_amount, subtotal, status) 
                          VALUES (:user_id, :order_number, 0, 0, 'cart')";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->bindParam(':order_number', $order_number);
                $stmt->execute();
                $order_id = $db->lastInsertId();
            } else {
                $orderRow = $stmt->fetch(PDO::FETCH_ASSOC);
                $order_id = $orderRow['id'];
            }
            
            // Check if item already exists in cart
            $query = "SELECT id, quantity FROM order_items WHERE order_id = :order_id AND menu_item_id = :menu_item_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':order_id', $order_id);
            $stmt->bindParam(':menu_item_id', $data->menu_item_id);
            $stmt->execute();
            
            $total_price = $menuItem['price'] * $data->quantity;
            $customizations = isset($data->customizations) ? json_encode($data->customizations) : null;
            $special_instructions = isset($data->special_instructions) ? $data->special_instructions : null;
            
            if ($stmt->rowCount() > 0) {
                // Update existing item quantity
                $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);
                $new_quantity = $existingItem['quantity'] + $data->quantity;
                $new_total = $menuItem['price'] * $new_quantity;
                
                $query = "UPDATE order_items SET quantity = :quantity, total_price = :total_price WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':quantity', $new_quantity);
                $stmt->bindParam(':total_price', $new_total);
                $stmt->bindParam(':id', $existingItem['id']);
                $stmt->execute();
            } else {
                // Add new item to cart
                $query = "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, customizations, special_instructions)
                          VALUES (:order_id, :menu_item_id, :quantity, :unit_price, :total_price, :customizations, :special_instructions)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':order_id', $order_id);
                $stmt->bindParam(':menu_item_id', $data->menu_item_id);
                $stmt->bindParam(':quantity', $data->quantity);
                $stmt->bindParam(':unit_price', $menuItem['price']);
                $stmt->bindParam(':total_price', $total_price);
                $stmt->bindParam(':customizations', $customizations);
                $stmt->bindParam(':special_instructions', $special_instructions);
                $stmt->execute();
            }
            
            // Update order totals
            $query = "UPDATE orders o 
                      SET o.subtotal = (SELECT SUM(total_price) FROM order_items WHERE order_id = :order_id),
                          o.tax_amount = (SELECT SUM(total_price) * 0.05 FROM order_items WHERE order_id = :order_id),
                          o.total_amount = (SELECT SUM(total_price) * 1.05 FROM order_items WHERE order_id = :order_id)
                      WHERE o.id = :order_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':order_id', $order_id);
            $stmt->execute();
            
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Item added to cart.",
                "order_id" => $order_id
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

