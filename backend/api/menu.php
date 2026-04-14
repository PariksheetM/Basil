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

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get all menu categories with items
    $query = "SELECT 
                mc.id, 
                mc.name, 
                mc.description, 
                mc.image_url,
                mc.display_order,
                mc.is_active
              FROM menu_categories mc
              WHERE mc.is_active = 1
              ORDER BY mc.display_order, mc.name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Get menu items for this category
        $itemQuery = "SELECT 
                        id, 
                        name, 
                        description, 
                        price, 
                        image_url,
                        is_available,
                        is_vegetarian,
                        is_vegan,
                        spice_level,
                        calories,
                        preparation_time
                      FROM menu_items
                      WHERE category_id = :category_id AND is_available = 1
                      ORDER BY display_order, name";
        
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->bindParam(':category_id', $row['id']);
        $itemStmt->execute();
        
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $row['items'] = $items;
        $categories[] = $row;
    }

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "data" => $categories
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>

