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
    
    // Key metrics
    $stmt = $db->query("SELECT COUNT(*) as totalOrders FROM orders WHERE status != 'cart'");
    $totalOrders = $stmt->fetch(PDO::FETCH_ASSOC)['totalOrders'];
    
    $stmt = $db->query("SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'cart'");
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['revenue'] ?? 0;
    
    $stmt = $db->query("SELECT COUNT(DISTINCT user_id) as customers FROM orders WHERE status != 'cart'");
    $totalCustomers = $stmt->fetch(PDO::FETCH_ASSOC)['customers'];
    
    $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
    
    // Revenue trend (last 6 months)
    $stmt = $db->query("SELECT 
                            CASE strftime('%m', created_at)
                                WHEN '01' THEN 'Jan'
                                WHEN '02' THEN 'Feb'
                                WHEN '03' THEN 'Mar'  
                                WHEN '04' THEN 'Apr'
                                WHEN '05' THEN 'May'
                                WHEN '06' THEN 'Jun'
                                WHEN '07' THEN 'Jul'
                                WHEN '08' THEN 'Aug'
                                WHEN '09' THEN 'Sep'
                                WHEN '10' THEN 'Oct'
                                WHEN '11' THEN 'Nov'
                                WHEN '12' THEN 'Dec'
                            END as month,
                            SUM(total_amount) as revenue
                        FROM orders
                        WHERE status != 'cart' 
                        AND created_at >= date('now', '-6 months')
                        GROUP BY strftime('%Y-%m', created_at)
                        ORDER BY created_at ASC
                        LIMIT 6");
    $revenueData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Orders by occasion
    $stmt = $db->query("SELECT 
                            occasion as name,
                            COUNT(*) as orders,
                            SUM(total_amount) as revenue
                        FROM orders
                        WHERE status != 'cart' AND occasion IS NOT NULL
                        GROUP BY occasion
                        ORDER BY orders DESC");
    $occasionStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate percentages
    $totalOccasionOrders = array_sum(array_column($occasionStats, 'orders'));
    foreach ($occasionStats as &$stat) {
        $stat['percentage'] = $totalOccasionOrders > 0 ? 
            round(($stat['orders'] / $totalOccasionOrders) * 100, 1) : 0;
        $stat['revenue'] = (float)$stat['revenue'];
    }
    
    // Top customers
    $stmt = $db->query("SELECT 
                            u.full_name as name,
                            COUNT(o.id) as orders,
                            SUM(o.total_amount) as spent,
                            SUBSTR(u.full_name, 1, 1) as avatar
                        FROM users u
                        JOIN orders o ON u.id = o.user_id
                        WHERE o.status != 'cart'
                        GROUP BY u.id
                        ORDER BY spent DESC
                        LIMIT 4");
    $topCustomers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($topCustomers as &$customer) {
        $customer['spent'] = (float)$customer['spent'];
        $customer['orders'] = (int)$customer['orders'];
    }
    
    // Popular meals
    $stmt = $db->query("SELECT 
                            meal_plan_name as name,
                            COUNT(*) as orders,
                            SUM(total_amount) as revenue
                        FROM orders
                        WHERE status != 'cart' AND meal_plan_name IS NOT NULL
                        GROUP BY meal_plan_name
                        ORDER BY orders DESC
                        LIMIT 4");
    $popularMeals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($popularMeals as &$meal) {
        $meal['revenue'] = (float)$meal['revenue'];
        $meal['orders'] = (int)$meal['orders'];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'metrics' => [
                'totalOrders' => (int)$totalOrders,
                'totalRevenue' => (float)$totalRevenue,
                'totalCustomers' => (int)$totalCustomers,
                'avgOrderValue' => round($avgOrderValue, 2)
            ],
            'revenueData' => $revenueData,
            'occasionStats' => $occasionStats,
            'topCustomers' => $topCustomers,
            'popularMeals' => $popularMeals
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch analytics',
        'error' => $e->getMessage()
    ]);
}
?>
