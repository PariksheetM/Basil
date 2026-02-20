<?php
$db = new PDO('sqlite:database/food_ordering.db');
$email = 'newuser2@example.com';

$stmt = $db->prepare("SELECT id, full_name, email, password FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✓ User found:\n";
    echo "  ID: {$user['id']}\n";
    echo "  Name: {$user['full_name']}\n";
    echo "  Email: {$user['email']}\n";
    echo "  Password hash: " . substr($user['password'], 0, 30) . "...\n\n";
    
    // Test password verification
    $testPassword = 'Test@123';
    $isValid = password_verify($testPassword, $user['password']);
    echo "Password 'Test@123' verification: " . ($isValid ? "✓ VALID" : "✗ INVALID") . "\n";
    
    // Show all users
    echo "\nAll users:\n";
    $all = $db->query("SELECT id, email, full_name FROM users ORDER BY id DESC LIMIT 5")->fetchAll();
    foreach ($all as $u) {
        echo "  {$u['id']}. {$u['full_name']} - {$u['email']}\n";
    }
} else {
    echo "✗ User not found: $email\n";
}
?>
