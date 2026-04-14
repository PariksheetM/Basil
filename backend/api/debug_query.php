<?php
require_once '../config/database_sqlite.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $token = '9d74441e9e1ec58689487eb6b1e87a2b77f47aeb17cd1c4d67edc5b48cd8e8ea';
    
    // Test 1: Just find the session
    $q1 = "SELECT id, session_token, expires_at, datetime('now') as now_time FROM user_sessions WHERE session_token = :token";
    $s1 = $db->prepare($q1);
    $s1->bindParam(':token', $token);
    $s1->execute();
    $result1 = $s1->fetchAll(PDO::FETCH_ASSOC);
    
    // Test 2: Compare with > operator
    $q2 = "SELECT id, expires_at > datetime('now') as is_valid FROM user_sessions WHERE session_token = :token";
    $s2 = $db->prepare($q2);
    $s2->bindParam(':token', $token);
    $s2->execute();
    $result2 = $s2->fetchAll(PDO::FETCH_ASSOC);
    
    // Test 3: The actual query
    $q3 = "SELECT user_id FROM user_sessions WHERE session_token = :token AND expires_at > datetime('now')";
    $s3 = $db->prepare($q3);
    $s3->bindParam(':token', $token);
    $s3->execute();
    $result3 = $s3->fetchAll(PDO::FETCH_ASSOC);
    $count3 = $s3->rowCount();
    
    echo json_encode([
        'test1_find_session' => $result1,
        'test2_comparison' => $result2,
        'test3_actual_query' => $result3,
        'test3_rowcount' => $count3
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
