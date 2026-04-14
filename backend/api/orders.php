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

    // Some installs use SPA-only order payloads and may not have legacy order_items/menu_items tables.
    $orderItemsTableExists = (bool)$db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items' LIMIT 1")->fetchColumn();
    $menuItemsTableExists = (bool)$db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_items' LIMIT 1")->fetchColumn();

    // Verify session
    $query = "SELECT user_id FROM user_sessions WHERE session_token = :session_token AND expires_at > datetime('now')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":session_token", $session_token);
    $stmt->execute();

    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$session) {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid or expired session."
        ));
        exit();
    }

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
                o.occasion,
                o.meal_plan_name,
                o.guest_count,
                o.notes,
                o.event_date,
                o.created_at,
                                o.updated_at,
                                0 as item_count
              FROM orders o
              WHERE o.user_id = :user_id AND o.status != 'cart'
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get items for each order
    foreach ($orders as &$order) {
                $dbItems = [];
                if ($orderItemsTableExists && $menuItemsTableExists) {
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

                        $dbItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
                }

        // Fallback for SPA checkout flow where selected items are saved in orders.notes JSON
        $parsedNotes = json_decode($order['notes'] ?? '', true) ?: [];
        $noteItems = [];
        if (is_array($parsedNotes['items'] ?? null)) {
            foreach ($parsedNotes['items'] as $savedItem) {
                if (!is_array($savedItem)) {
                    continue;
                }

                $selectedItems = $savedItem['customizations']['selectedItems'] ?? [];
                $selectedNames = [];
                if (is_array($selectedItems)) {
                    foreach ($selectedItems as $selected) {
                        if (is_array($selected)) {
                            $selectedNames[] = $selected['name'] ?? ($selected['title'] ?? 'Selected Item');
                        } else {
                            $selectedNames[] = (string)$selected;
                        }
                    }
                }

                $noteItems[] = [
                    'id' => $savedItem['id'] ?? null,
                    'quantity' => $savedItem['guests'] ?? 1,
                    'unit_price' => null,
                    'total_price' => $savedItem['total'] ?? 0,
                    'item_name' => $savedItem['name'] ?? ($order['meal_plan_name'] ?? 'Meal Plan'),
                    'item_image' => $savedItem['image'] ?? null,
                    'selected_items' => $selectedNames,
                ];
            }
        }

        $order['items'] = count($dbItems) > 0 ? $dbItems : $noteItems;
        $order['item_count'] = count($order['items']);
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

