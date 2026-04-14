<?php
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
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
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
        $db->exec("CREATE TABLE IF NOT EXISTS quote_requests (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            email       TEXT,
            event_date  TEXT    NOT NULL,
            guest_count INTEGER NOT NULL,
            dishes_json TEXT    NOT NULL,
            notes       TEXT,
            status      TEXT    NOT NULL DEFAULT 'pending',
            created_at  DATETIME DEFAULT (DATETIME('now'))
        )");

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
            $rawAddOns = [];

            if (is_array($rawItems) && count($rawItems) > 0) {
                foreach ($rawItems as $item) {
                    if (!is_array($item)) {
                        continue;
                    }

                    $selectedItems = $item['customizations']['selectedItems'] ?? [];
                    if (is_array($selectedItems) && count($selectedItems) > 0) {
                        foreach ($selectedItems as $selected) {
                            if (is_array($selected)) {
                                $menuItems[] = $selected['name'] ?? ($selected['title'] ?? 'Selected Item');
                            } else {
                                $menuItems[] = (string)$selected;
                            }
                        }
                    } else {
                        $menuItems[] = $item['name'] ?? ($item['title'] ?? 'Meal Plan');
                    }

                    $selectedAddOns = $item['customizations']['addedItems'] ?? [];
                    if (is_array($selectedAddOns) && count($selectedAddOns) > 0) {
                        foreach ($selectedAddOns as $addon) {
                            if (is_array($addon)) {
                                $rawAddOns[] = [
                                    'name' => $addon['name'] ?? ($addon['title'] ?? 'Add-on'),
                                    'price' => isset($addon['price']) ? (float)$addon['price'] : 0,
                                ];
                            }
                        }
                    }
                }
            }

            // Backward compatibility with previous payload shape
            if (empty($rawAddOns)) {
                $legacyAddOns = $notes['selections']['addOns'] ?? [];
                if (is_array($legacyAddOns)) {
                    foreach ($legacyAddOns as $legacy) {
                        if (is_array($legacy)) {
                            $rawAddOns[] = [
                                'name' => $legacy['name'] ?? ($legacy['title'] ?? 'Add-on'),
                                'price' => isset($legacy['price']) ? (float)$legacy['price'] : 0,
                            ];
                        }
                    }
                }
            }

            $addOns = [];
            foreach ($rawAddOns as $addOn) {
                if (is_array($addOn)) {
                    $addOns[] = [
                        'name' => $addOn['name'] ?? ($addOn['title'] ?? 'Add-on'),
                        'price' => isset($addOn['price']) ? (float)$addOn['price'] : 0,
                    ];
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

        $quoteRows = $db->query("SELECT * FROM quote_requests ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
        $formattedQuotes = array_map(function($quote) {
            $dishes = json_decode($quote['dishes_json'] ?? '[]', true) ?: [];
            $dishNames = [];
            foreach ($dishes as $dish) {
                if (is_array($dish)) {
                    $dishNames[] = $dish['name'] ?? 'Dish';
                } else {
                    $dishNames[] = (string)$dish;
                }
            }

            return [
                'id' => 'QUOTE-' . $quote['id'],
                'customer' => [
                    'name' => $quote['name'],
                    'email' => $quote['email'] ?: 'N/A',
                    'phone' => $quote['phone'] ?: 'N/A',
                ],
                'occasion' => 'Custom Event',
                'mealPlan' => 'Quote Request',
                'guestCount' => (int)$quote['guest_count'],
                'basePrice' => 0,
                'totalAmount' => 0,
                'date' => $quote['event_date'] ?: date('Y-m-d', strtotime($quote['created_at'])),
                'time' => 'N/A',
                'status' => 'Quote-' . ($quote['status'] ?: 'pending'),
                'address' => 'N/A',
                'items' => $dishNames,
                'addedItems' => [],
                'notes' => $quote['notes'] ?? '',
                'isQuote' => true,
            ];
        }, $quoteRows);

        $allRows = array_merge($formattedOrders, $formattedQuotes);
        usort($allRows, function($a, $b) {
            return strcmp($b['date'] ?? '', $a['date'] ?? '');
        });
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $allRows
        ]);
        
    } elseif ($method === 'PUT') {
        // Update order status
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['orderId']) || !isset($data['status'])) {
            throw new Exception('Order ID and status are required');
        }

        if (strpos($data['orderId'], 'QUOTE-') === 0) {
            $quoteId = (int)str_replace('QUOTE-', '', $data['orderId']);
            $quoteStatus = strtolower(str_replace('Quote-', '', $data['status']));
            $stmt = $db->prepare("UPDATE quote_requests SET status = :status WHERE id = :id");
            $stmt->execute([':status' => $quoteStatus, ':id' => $quoteId]);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Quote request status updated successfully'
            ]);
            exit;
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

        if (strpos($data['orderId'], 'QUOTE-') === 0) {
            $quoteId = (int)str_replace('QUOTE-', '', $data['orderId']);
            $stmt = $db->prepare("DELETE FROM quote_requests WHERE id = :id");
            $stmt->execute([':id' => $quoteId]);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Quote request deleted successfully'
            ]);
            exit;
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
