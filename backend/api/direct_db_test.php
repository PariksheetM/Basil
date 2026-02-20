<?php
// Direct database test without using the Database class

$dbPath = __DIR__ . '/../database/food_ordering.db';

header('Content-Type: application/json');

try {
    $conn = new PDO("sqlite:" . $dbPath);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $query = "SELECT id, full_name, email, created_at FROM users ORDER BY id DESC LIMIT 10";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(array(
        "success" => true,
        "database_path" => $dbPath,
        "count" => count($users),
        "users" => $users
    ), JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode(array(
        "success" => false,
        "error" => $e->getMessage()
    ));
}
?>
