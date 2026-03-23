<?php
require_once '../config/database_sqlite.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array(
        "success" => true,
        "count" => count($users),
        "users" => $users
    ), JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>
