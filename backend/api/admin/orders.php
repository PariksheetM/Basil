<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database_sqlite.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Admin auth
    $headers = getallheaders();
    $sessionToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    if (!$sessionToken) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization required']);
        exit;
    }

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

    $authStmt = $db->prepare("SELECT u.id, u.email, u.role FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = :token AND s.expires_at > datetime('now')");
    $authStmt->bindParam(':token', $sessionToken);
    $authStmt->execute();
    $adminUser = $authStmt->fetch(PDO::FETCH_ASSOC);

    if (!$adminUser || ($adminUser['role'] ?? 'user') !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access only']);
        exit;
    }

    if ($method === 'GET') {
        // Ensure contact_name column exists (for checkout-provided name)
        $hasContactName = false;
        $cols = $db->query("PRAGMA table_info(orders)")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $col) {
            if (isset($col['name']) && $col['name'] === 'contact_name') {
                $hasContactName = true;
                break;
            }
        }
        if (!$hasContactName) {
            $db->exec("ALTER TABLE orders ADD COLUMN contact_name TEXT");
        }

        // Get all orders with customer details
        $stmt = $db->query("SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
                            FROM orders o
                            JOIN users u ON o.user_id = u.id
                            WHERE o.status != 'cart'
                            ORDER BY o.created_at DESC");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format orders data
        $formattedOrders = array_map(function($order) {
            $notes = json_decode($order['notes'] ?? '', true) ?: [];
            $contactInfo = $notes['contactInfo'] ?? [];
            $customerName = $order['contact_name'] ?? $contactInfo['fullName'] ?? $contactInfo['name'] ?? $order['customer_name'];

            $rawItems = $notes['items'] ?? [];
            $menuItems = [];
            if (is_array($rawItems)) {
                foreach ($rawItems as $item) {
                    if (is_array($item)) {
                        $menuItems[] = $item['name'] ?? $item['title'] ?? json_encode($item);
                    } else {
                        $menuItems[] = (string)$item;
                    }
                }
            }

            $rawAddOns = $notes['selections']['addOns'] ?? [];
            $addOns = [];
            if (is_array($rawAddOns)) {
                foreach ($rawAddOns as $addOn) {
                    if (is_array($addOn)) {
                        $addOns[] = [
                            'name' => $addOn['name'] ?? ($addOn['title'] ?? 'Add-on'),
                            'price' => isset($addOn['price']) ? (float)$addOn['price'] : 0
                        ];
                    }
                }
            }

            return [
                'id' => $order['order_number'],
                'customer' => [
                    'name' => $customerName,
                    'email' => $order['customer_email'],
                    'phone' => $order['customer_phone'] ?? ($contactInfo['phone'] ?? 'N/A')
                ],
                'occasion' => $order['occasion'] ?? ($notes['eventDetails']['occasion'] ?? 'N/A'),
                'mealPlan' => $order['meal_plan_name'] ?? $notes['packageSelections']['name'] ?? 'N/A',
                'guestCount' => (int)$order['guest_count'],
                'basePrice' => (float)$order['subtotal'] / max(1, ($order['guest_count'] ?: 1)),
                'totalAmount' => (float)$order['total_amount'],
                'date' => date('Y-m-d', strtotime($order['event_date'] ?? $order['created_at'])),
                'time' => $order['event_time'] ?? '12:00 PM',
                'status' => $order['status'],
                'address' => $order['delivery_address'] ?? 'N/A',
                'items' => $menuItems,
                'addedItems' => $addOns
            ];
        }, $orders);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $formattedOrders
        ]);
        
    } elseif ($method === 'PUT') {
        // Update order status
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['orderId']) || !isset($data['status'])) {
            throw new Exception('Order ID and status are required');
        }
        
        $stmt = $db->prepare("UPDATE orders SET status = ?, updated_at = datetime('now') 
                             WHERE order_number = ?");
        $stmt->execute([$data['status'], $data['orderId']]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Order status updated successfully'
        ]);
        
    } elseif ($method === 'DELETE') {
        // Delete order
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['orderId'])) {
            throw new Exception('Order ID is required');
        }
        
        $stmt = $db->prepare("DELETE FROM orders WHERE order_number = ?");
        $stmt->execute([$data['orderId']]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Operation failed',
        'error' => $e->getMessage()
    ]);
}
?>
