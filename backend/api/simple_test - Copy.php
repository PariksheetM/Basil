<?php
$dbPath = __DIR__ . '/../database/food_ordering.db';
header('Content-Type: text/plain');

$email = 'testlogin@example.com';

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Testing with email: $email\n\n";
    
    // Query with hardcoded email
    $query = "SELECT id, email, password FROM users WHERE email = 'testlogin@example.com'";
    $stmt = $db->query($query);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Results: " . count($result) . " rows\n";
    if (count($result) > 0) {
        foreach ($result as $row) {
            echo "ID: {$row['id']}, Email: {$row['email']}\n";
            echo "Password hash: {$row['password']}\n";
        }
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
