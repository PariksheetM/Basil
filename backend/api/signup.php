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
if (empty($data->full_name) || empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "All fields are required."
    ));
    exit();
}

// Validate email format
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid email format."
    ));
    exit();
}

// Validate password length
if (strlen($data->password) < 6) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Password must be at least 6 characters long."
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

    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(array(
            "success" => false,
            "message" => "Email already registered."
        ));
        exit();
    }

    // Insert new user (role defaults to user)
    $query = "INSERT INTO users (full_name, email, password, role) VALUES (:full_name, :email, :password, 'user')";
    $stmt = $db->prepare($query);

    // Hash password
    $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

    // Bind parameters
    $stmt->bindParam(":full_name", $data->full_name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", $hashed_password);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "User registered successfully."
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to register user."
        ));
    }
} catch (PDOException $e) {
    // Check if it's a unique constraint violation
    if ($e->getCode() == 23000 || strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
        http_response_code(409);
        echo json_encode(array(
            "success" => false,
            "message" => "Email already registered."
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ));
    }
}
?>

