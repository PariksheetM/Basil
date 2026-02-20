<?php
// Create an order directly from the SPA checkout payload (no cart dependency)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database_sqlite.php';

$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (empty($session_token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required.']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure optional columns exist (avoids insert failures)
    $cols = $db->query("PRAGMA table_info(orders)")->fetchAll(PDO::FETCH_ASSOC);
    $hasRetainer = false;
    $hasContactName = false;
    foreach ($cols as $col) {
        if (isset($col['name']) && $col['name'] === 'service_retainer') {
            $hasRetainer = true;
        }
        if (isset($col['name']) && $col['name'] === 'contact_name') {
            $hasContactName = true;
        }
    }
    if (!$hasRetainer) {
        $db->exec("ALTER TABLE orders ADD COLUMN service_retainer DECIMAL(10,2) DEFAULT 0");
    }
    if (!$hasContactName) {
        $db->exec("ALTER TABLE orders ADD COLUMN contact_name TEXT");
    }

    // Verify session
    $stmt = $db->prepare("SELECT u.id, u.full_name, u.email FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = :token AND s.expires_at > datetime('now')");
    $stmt->bindParam(':token', $session_token);
    $stmt->execute();

    $sessionUser = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$sessionUser) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired session.']);
        exit();
    }

    $payload = json_decode(file_get_contents('php://input'), true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
        exit();
    }

    $occasion = $payload['occasion'] ?? 'Custom Event';
    $mealPlanName = $payload['mealPlanName'] ?? ($payload['package']['name'] ?? 'Meal Plan');
    $guestCount = (int)($payload['guestCount'] ?? 0);
    $totals = $payload['totals'] ?? [];
    $totalAmount = (float)($totals['grandTotal'] ?? 0);
    $subtotal = (float)($totals['menuSubtotal'] ?? $totalAmount);
    $taxAmount = (float)($totals['taxes'] ?? 0);
    $deliveryFee = (float)($totals['logisticsFee'] ?? 0);
    $serviceRetainer = (float)($totals['serviceRetainer'] ?? 0);
    $eventDate = $payload['eventDetails']['date'] ?? null;
    $eventTime = $payload['eventDetails']['timeSlot'] ?? null;
    $deliveryAddress = $payload['eventDetails']['venue'] ?? null;
    $deliveryPhone = $payload['contactInfo']['phone'] ?? null;
    $contactName = $payload['contactInfo']['fullName'] ?? ($payload['contactInfo']['name'] ?? $sessionUser['full_name']);
    $paymentMethod = $payload['paymentMethod'] ?? 'card';

    $orderNumber = 'ORD-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));

    // Persist order
    $stmt = $db->prepare("INSERT INTO orders (
        user_id, order_number, total_amount, subtotal, tax_amount, delivery_fee, discount_amount,
        status, payment_status, payment_method, delivery_address, delivery_phone, delivery_instructions,
        notes, occasion, meal_plan_name, guest_count, event_date, event_time, service_retainer, contact_name
    ) VALUES (
        :user_id, :order_number, :total_amount, :subtotal, :tax_amount, :delivery_fee, 0,
        'pending', 'pending', :payment_method, :delivery_address, :delivery_phone, :delivery_instructions,
        :notes, :occasion, :meal_plan_name, :guest_count, :event_date, :event_time, :service_retainer, :contact_name
    )");

    $notes = json_encode([
        'items' => $payload['items'] ?? [],
        'selections' => $payload['packageSelections'] ?? null,
        'pricingSnapshot' => $payload['pricingSnapshot'] ?? null,
        'contactInfo' => $payload['contactInfo'] ?? null,
        'eventDetails' => $payload['eventDetails'] ?? null,
    ]);

    $deliveryInstructions = $payload['eventDetails']['notes'] ?? ($payload['specialRequests'] ?? '');

    $stmt->bindParam(':user_id', $sessionUser['id']);
    $stmt->bindParam(':order_number', $orderNumber);
    $stmt->bindParam(':total_amount', $totalAmount);
    $stmt->bindParam(':subtotal', $subtotal);
    $stmt->bindParam(':tax_amount', $taxAmount);
    $stmt->bindParam(':delivery_fee', $deliveryFee);
    $stmt->bindParam(':payment_method', $paymentMethod);
    $stmt->bindParam(':delivery_address', $deliveryAddress);
    $stmt->bindParam(':delivery_phone', $deliveryPhone);
    $stmt->bindParam(':delivery_instructions', $deliveryInstructions);
    $stmt->bindParam(':notes', $notes);
    $stmt->bindParam(':occasion', $occasion);
    $stmt->bindParam(':meal_plan_name', $mealPlanName);
    $stmt->bindParam(':guest_count', $guestCount);
    $stmt->bindParam(':event_date', $eventDate);
    $stmt->bindParam(':event_time', $eventTime);
    $stmt->bindParam(':service_retainer', $serviceRetainer);
    $stmt->bindParam(':contact_name', $contactName);
    $stmt->execute();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Order captured',
        'data' => [
            'order_number' => $orderNumber,
            'guest_count' => $guestCount,
            'occasion' => $occasion,
            'meal_plan_name' => $mealPlanName,
            'totals' => [
                'menuSubtotal' => $subtotal,
                'taxes' => $taxAmount,
                'logisticsFee' => $deliveryFee,
                'serviceRetainer' => $serviceRetainer,
                'grandTotal' => $totalAmount,
            ],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create order', 'error' => $e->getMessage()]);
}
?>