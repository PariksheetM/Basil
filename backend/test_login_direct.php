<?php
// Direct test of login logic
$dbPath = __DIR__ . '/database/food_ordering.db';

// Simulate incoming JSON
$json = '{"email":"newuser2@example.com","password":"Test@123"}';
$data = json_decode($json);

echo "Testing login with:\n";
echo "Email: {$data->email}\n";
echo "Password: {$data->password}\n\n";

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get user from database
    $query = "SELECT id, full_name, email, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindValue(":email", $data->email, PDO::PARAM_STR);
    $stmt->execute();

    echo "Row count: " . $stmt->rowCount() . "\n";

    if ($stmt->rowCount() === 0) {
        echo "✗ User not found!\n";
        exit();
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ User found: {$row['full_name']}\n";
    echo "Password hash: " . substr($row['password'], 0, 40) . "...\n\n";

    // Verify password
    $verified = password_verify($data->password, $row['password']);
    echo "Password verification: " . ($verified ? "✓ SUCCESS" : "✗ FAILED") . "\n\n";

    if ($verified) {
        echo "Login would succeed!\n";
        $session_token = bin2hex(random_bytes(32));
        echo "Session token: " . substr($session_token, 0, 20) . "...\n";
    } else {
        echo "Login would fail - password mismatch\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}
?>
