<?php
$db = new PDO('sqlite:database/food_ordering.db');
$count = $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
echo "Total users: $count\n\n";

$users = $db->query('SELECT id, full_name, email, created_at FROM users ORDER BY id DESC LIMIT 5')->fetchAll();
echo "Latest registered users:\n";
foreach($users as $u) {
    echo "  ✓ {$u['full_name']} ({$u['email']}) - " . date('Y-m-d H:i', strtotime($u['created_at'])) . "\n";
}
?>
