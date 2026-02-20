<?php
$db = new PDO('sqlite:database/food_ordering.db');

echo "Current sessions in database:\n\n";
$sessions = $db->query("SELECT user_id, session_token, expires_at, created_at FROM user_sessions ORDER BY created_at DESC LIMIT 5")->fetchAll();

if (empty($sessions)) {
    echo "No sessions found!\n";
} else {
    foreach ($sessions as $s) {
        echo "User ID: {$s['user_id']}\n";
        echo "Token: " . substr($s['session_token'], 0, 20) . "...\n";
        echo "Expires: {$s['expires_at']}\n";
        echo "Created: {$s['created_at']}\n";
        
        // Check if expired
        $now = date('Y-m-d H:i:s');
        $isExpired = $s['expires_at'] < $now;
        echo "Status: " . ($isExpired ? "EXPIRED" : "ACTIVE") . "\n";
        echo "---\n\n";
    }
}
?>
