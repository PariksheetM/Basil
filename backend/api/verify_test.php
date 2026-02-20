<?php
$dbPath = __DIR__ . '/../database/food_ordering.db';
header('Content-Type: text/plain');

$email = 'testlogin@example.com';
$password = 'password123';

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $query = "SELECT id, email, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        echo "User found: {$row['email']}\n";
        echo "Password hash: {$row['password']}\n";
        echo "Testing password: $password\n";
        
        $verify = password_verify($password, $row['password']);
        echo "Password verify result: " . ($verify ? "TRUE" : "FALSE") . "\n";
    } else {
        echo "User not found\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
