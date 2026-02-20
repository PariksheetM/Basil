<?php
require_once '../config/database_sqlite.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $dbPath = dirname(__DIR__) . '/database/food_ordering.db';
    
    echo json_encode(array(
        "success" => true,
        "database_path" => $dbPath,
        "database_exists" => file_exists($dbPath),
        "database_size" => filesize($dbPath),
        "database_writable" => is_writable($dbPath),
        "current_dir" => getcwd(),
        "script_dir" => __DIR__
    ), JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(array(
        "success" => false,
        "error" => $e->getMessage()
    ));
}
?>
