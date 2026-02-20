<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database_sqlite.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all customers with their order statistics
    $stmt = $db->query("SELECT 
                            u.id,
                            u.full_name as name,
                            u.email,
                            u.phone,
                            u.address,
                            DATE(u.created_at) as joinDate,
                            COUNT(o.id) as totalOrders,
                            COALESCE(SUM(o.total_amount), 0) as totalSpent,
                            (SELECT occasion FROM orders WHERE user_id = u.id AND status != 'cart' 
                             GROUP BY occasion ORDER BY COUNT(*) DESC LIMIT 1) as favoriteOccasion
                        FROM users u
                        LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cart'
                        GROUP BY u.id
                        HAVING totalOrders > 0
                        ORDER BY totalSpent DESC");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent orders and most ordered meals for each customer
    $formattedCustomers = array_map(function($customer) use ($db) {
        // Get recent orders
        $stmt = $db->prepare("SELECT order_number as id, DATE(created_at) as date, 
                              total_amount as amount, occasion
                              FROM orders
                              WHERE user_id = ? AND status != 'cart'
                              ORDER BY created_at DESC
                              LIMIT 3");
        $stmt->execute([$customer['id']]);
        $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get most ordered meals
        $stmt = $db->prepare("SELECT meal_plan_name
                              FROM orders
                              WHERE user_id = ? AND status != 'cart' AND meal_plan_name IS NOT NULL
                              GROUP BY meal_plan_name
                              ORDER BY COUNT(*) DESC
                              LIMIT 3");
        $stmt->execute([$customer['id']]);
        $mostOrdered = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return [
            'id' => (int)$customer['id'],
            'name' => $customer['name'],
            'email' => $customer['email'],
            'phone' => $customer['phone'] ?? 'N/A',
            'joinDate' => $customer['joinDate'],
            'totalOrders' => (int)$customer['totalOrders'],
            'totalSpent' => (float)$customer['totalSpent'],
            'favoriteOccasion' => $customer['favoriteOccasion'] ?? 'N/A',
            'recentOrders' => $recentOrders,
            'address' => $customer['address'] ?? 'N/A',
            'mostOrdered' => $mostOrdered
        ];
    }, $customers);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formattedCustomers
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch customers',
        'error' => $e->getMessage()
    ]);
}
?>
