<?php
$db = new PDO('sqlite:database/food_ordering.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get the latest session token
$latest = $db->query("SELECT session_token FROM user_sessions ORDER BY created_at DESC LIMIT 1")->fetch();
$session_token = $latest['session_token'];

echo "Testing session: " . substr($session_token, 0, 20) . "...\n\n";

// Test the exact query from verify_session.php
$query = "SELECT us.user_id, u.full_name, u.email 
          FROM user_sessions us 
          JOIN users u ON us.user_id = u.id 
          WHERE us.session_token = :session_token 
          AND us.expires_at > datetime('now')";

$stmt = $db->prepare($query);
$stmt->bindParam(":session_token", $session_token);
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo "✓ Session found and valid!\n";
    echo "User ID: {$row['user_id']}\n";
    echo "Name: {$row['full_name']}\n";
    echo "Email: {$row['email']}\n";
} else {
    echo "✗ Session NOT found or expired\n";
    
    // Debug: check why
    echo "\nDebug info:\n";
    $check = $db->prepare("SELECT expires_at FROM user_sessions WHERE session_token = ?");
    $check->execute([$session_token]);
    $exp = $check->fetch();
    if ($exp) {
        echo "  Session exists\n";
        echo "  Expires at: {$exp['expires_at']}\n";
        echo "  Current time: " . date('Y-m-d H:i:s') . "\n";
        echo "  SQLite now: " . $db->query("SELECT datetime('now')")->fetchColumn() . "\n";
    } else {
        echo "  Session not found in DB\n";
    }
}
?>
