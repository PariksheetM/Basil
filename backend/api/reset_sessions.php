<?php
// Reset all expired sessions to current date + 24 hours
require_once '../config/database_sqlite.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Update all sessions to expire 24 hours from now
    $query = "UPDATE user_sessions SET expires_at = datetime('now', '+24 hours') WHERE expires_at < datetime('now')";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $affected = $db->exec($query);
    
    echo json_encode([
        'success' => true,
        'message' => 'Updated expired sessions',
        'query_run' => $query
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
