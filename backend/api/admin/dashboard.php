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
    
    // Get total orders count
    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status != 'cart'");
    $totalOrders = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get today's orders count
    $stmt = $db->query("SELECT COUNT(*) as today FROM orders 
                        WHERE DATE(created_at) = DATE('now') AND status != 'cart'");
    $todayOrders = $stmt->fetch(PDO::FETCH_ASSOC)['today'];
    
    // Get total revenue
    $stmt = $db->query("SELECT SUM(total_amount) as revenue FROM orders 
                        WHERE status != 'cart' AND status != 'cancelled'");
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['revenue'] ?? 0;
    
    // Get pending orders count
    $stmt = $db->query("SELECT COUNT(*) as pending FROM orders WHERE status = 'Pending'");
    $pendingOrders = $stmt->fetch(PDO::FETCH_ASSOC)['pending'];
    
    // Get recent orders (last 5)
    $stmt = $db->query("SELECT o.*, u.full_name as customer_name, u.email as customer_email
                        FROM orders o
                        JOIN users u ON o.user_id = u.id
                        WHERE o.status != 'cart'
                        ORDER BY o.created_at DESC
                        LIMIT 5");
    $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get popular meals
    $stmt = $db->query("SELECT meal_plan_name, COUNT(*) as order_count, SUM(total_amount) as revenue
                        FROM orders
                        WHERE status != 'cart' AND meal_plan_name IS NOT NULL
                        GROUP BY meal_plan_name
                        ORDER BY order_count DESC
                        LIMIT 4");
    $popularMeals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get occasion distribution
    $stmt = $db->query("SELECT occasion, COUNT(*) as count
                        FROM orders
                        WHERE status != 'cart' AND occasion IS NOT NULL
                        GROUP BY occasion
                        ORDER BY count DESC
                        LIMIT 4");
    $occasionStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate total for percentage
    $totalOccasionOrders = array_sum(array_column($occasionStats, 'count'));
    
    // Add percentage to each occasion
    foreach ($occasionStats as &$stat) {
        $stat['percentage'] = $totalOccasionOrders > 0 ? 
            round(($stat['count'] / $totalOccasionOrders) * 100, 1) : 0;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'stats' => [
                'totalOrders' => (int)$totalOrders,
                'todayOrders' => (int)$todayOrders,
                'revenue' => (float)$totalRevenue,
                'pendingOrders' => (int)$pendingOrders
            ],
            'recentOrders' => $recentOrders,
            'popularMeals' => $popularMeals,
            'occasionStats' => $occasionStats
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch dashboard data',
        'error' => $e->getMessage()
    ]);
}
?>
