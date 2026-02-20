<?php
$dbPath = __DIR__ . '/../database/food_ordering.db';
header('Content-Type: application/json');

$input = file_get_contents("php://input");
$data = json_decode($input);

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get the user
    $query = "SELECT id, full_name, email, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(array(
            "found" => false,
            "email_searched" => $data->email
        ), JSON_PRETTY_PRINT);
        exit();
    }
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Test password
    $passwordProvided = $data->password ?? '';
    $passwordVerify = password_verify($passwordProvided, $row['password']);
    
    // Test hash
    $newHash = password_hash($passwordProvided, PASSWORD_BCRYPT);
    $newVerify = password_verify($passwordProvided, $newHash);
    
    echo json_encode(array(
        "found" => true,
        "user_id" => $row['id'],
        "email" => $row['email'],
        "full_name" => $row['full_name'],
        "password_provided" => $passwordProvided,
        "password_hash_in_db" => $row['password'],
        "password_hash_length" => strlen($row['password']),
        "password_verify_result" => $passwordVerify,
        "test_new_hash" => $newHash,
        "test_new_verify" => $newVerify,
        "raw_input" => $input
    ), JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode(array(
        "error" => $e->getMessage()
    ));
}
?>
