<?php
require_once '../config/database_sqlite.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $result = $db->query("SELECT datetime('now') as current_time, datetime('now', '+1 hour') as one_hour_later")->fetchAll(PDO::FETCH_ASSOC);
    
    $expireTest = $db->query("SELECT '2026-04-14 10:35:10' > datetime('now') as is_future")->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'db_times' => $result,
        'expire_test' => $expireTest,
        'system_date_context' => 'April 13, 2026'
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
