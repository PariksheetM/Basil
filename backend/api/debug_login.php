<?php
require_once '../config/database_sqlite.php';

header('Content-Type: application/json');

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email)) {
    echo json_encode(array(
        "success" => false,
        "message" => "Email is required for debugging."
    ));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get user from database
    $query = "SELECT id, full_name, email, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        echo json_encode(array(
            "success" => false,
            "message" => "User not found with email: " . $data->email,
            "all_users" => "Check test_users.php to see all registered users"
        ));
        exit();
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $passwordMatch = false;
    if (!empty($data->password)) {
        $passwordMatch = password_verify($data->password, $row['password']);
    }

    echo json_encode(array(
        "success" => true,
        "user_found" => true,
        "user_id" => $row['id'],
        "full_name" => $row['full_name'],
        "email" => $row['email'],
        "password_provided" => !empty($data->password),
        "password_matches" => $passwordMatch,
        "password_hash_prefix" => substr($row['password'], 0, 20) . "..."
    ), JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>
