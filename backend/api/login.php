<?php
// Direct database connection to avoid schema recreation issues
$dbPath = __DIR__ . '/../database/food_ordering.db';

// CORS headers
$corsOrigin = 'http://localhost:5173';
header("Access-Control-Allow-Origin: " . $corsOrigin);
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input
if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Email and password are required."
    ));
    exit();
}

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure role column exists
    $hasRole = false;
    $cols = $db->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        if (isset($col['name']) && $col['name'] === 'role') {
            $hasRole = true;
            break;
        }
    }
    if (!$hasRole) {
        $db->exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    }

    // Get user from database
    $query = "SELECT id, full_name, email, password, role FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindValue(":email", $data->email, PDO::PARAM_STR);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$row) {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid email or password."
        ));
        exit();
    }

    // Verify password
    if (password_verify($data->password, $row['password'])) {
        // Generate session token
        $session_token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

        // Store session in database
        $query = "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (:user_id, :session_token, :expires_at)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $row['id']);
        $stmt->bindParam(":session_token", $session_token);
        $stmt->bindParam(":expires_at", $expires_at);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful.",
            "data" => array(
                "user_id" => $row['id'],
                "full_name" => $row['full_name'],
                "email" => $row['email'],
                "role" => $row['role'] ?? 'user',
                "session_token" => $session_token
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid email or password."
        ));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?>

