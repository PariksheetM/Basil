<?php
// Admin-only login endpoint
$dbPath = __DIR__ . '/../../database/food_ordering.db';

$corsOrigin = 'http://localhost:5173';
header("Access-Control-Allow-Origin: " . $corsOrigin);
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required.'
    ]);
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

    // Seed a default admin if none exists
    $adminCheck = $db->query("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'")->fetch(PDO::FETCH_ASSOC);
    if (($adminCheck['cnt'] ?? 0) == 0) {
        $insert = $db->prepare("INSERT INTO users (full_name, email, password, role) VALUES (:name, :email, :password, 'admin')");
        $defaultPass = password_hash('Admin@123', PASSWORD_BCRYPT);
        $insert->execute([
            ':name' => 'Admin User',
            ':email' => 'admin@local.test',
            ':password' => $defaultPass
        ]);
    }

    // Fetch admin user
    $stmt = $db->prepare("SELECT id, full_name, email, password, role FROM users WHERE email = :email");
    $stmt->bindValue(':email', $data->email, PDO::PARAM_STR);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || ($row['role'] ?? 'user') !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Admin access only.'
        ]);
        exit();
    }

    if (!password_verify($data->password, $row['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password.'
        ]);
        exit();
    }

    $session_token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $insertSession = $db->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (:user_id, :token, :expires)");
    $insertSession->execute([
        ':user_id' => $row['id'],
        ':token' => $session_token,
        ':expires' => $expires_at
    ]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Admin login successful.',
        'data' => [
            'user_id' => $row['id'],
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'role' => 'admin',
            'session_token' => $session_token
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
