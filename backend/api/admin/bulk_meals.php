<?php
// Admin: Bulk Meal Plan API
// GET    /api/admin/bulk_meals.php          – list all bulk meal plans (with dishes)
// POST   /api/admin/bulk_meals.php          – create a bulk meal plan
// PUT    /api/admin/bulk_meals.php          – update a bulk meal plan
// DELETE /api/admin/bulk_meals.php          – delete a bulk meal plan

$allowedOrigins = [
    'http://localhost:5173',
    'https://basil-five.vercel.app',
    'https://qsr.catalystsolutions.eco',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit(); }

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $h = [];
        foreach ($_SERVER as $k => $v) {
            if (strpos($k, 'HTTP_') === 0) {
                $h[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($k, 5)))))] = $v;
            }
        }
        return $h;
    }
}

function requireAdmin(PDO $db): int {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token   = trim(str_ireplace('Bearer', '', $auth));
    if (!$token) { http_response_code(401); echo json_encode(['success'=>false,'message'=>'No token']); exit(); }

    $stmt = $db->prepare(
        "SELECT u.id, u.role FROM user_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.session_token = :t AND s.expires_at > DATETIME('now')"
    );
    $stmt->execute([':t' => $token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || ($row['role'] ?? '') !== 'admin') {
        http_response_code(403); echo json_encode(['success'=>false,'message'=>'Admin only']); exit();
    }
    return (int)$row['id'];
}

// ── Helper: recalculate & upsert dishes for a meal plan ─────────────────────
function syncDishes(PDO $db, int $mealId, array $dishLines): float {
    // $dishLines = [ { dish_id, num_people }, ... ]
    $db->prepare("DELETE FROM bulk_meal_dishes WHERE bulk_meal_id = :m")->execute([':m' => $mealId]);

    $grandTotal = 0.0;
    $ins = $db->prepare(
        "INSERT INTO bulk_meal_dishes (bulk_meal_id, dish_id, num_people, required_quantity, total_cost)
         VALUES (:m, :d, :n, :rq, :tc)"
    );

    foreach ($dishLines as $line) {
        $dishId    = (int)($line['dish_id'] ?? 0);
        $numPeople = (int)($line['num_people'] ?? 0);
        if (!$dishId || $numPeople < 1) continue;

        $dish = $db->prepare("SELECT bulk_quantity, bulk_price, serves_people FROM dishes WHERE id=:id AND is_active=1");
        $dish->execute([':id' => $dishId]);
        $d = $dish->fetch(PDO::FETCH_ASSOC);
        if (!$d) continue;

        $qtyPerPerson   = (float)$d['bulk_quantity']  / (int)$d['serves_people'];
        $pricePerPerson = (float)$d['bulk_price']      / (int)$d['serves_people'];

        $requiredQty = round($qtyPerPerson  * $numPeople, 4);
        $totalCost   = round($pricePerPerson * $numPeople, 2);
        $grandTotal += $totalCost;

        $ins->execute([':m'=>$mealId, ':d'=>$dishId, ':n'=>$numPeople, ':rq'=>$requiredQty, ':tc'=>$totalCost]);
    }
    return round($grandTotal, 2);
}

// ── Helper: load full meal plan (with dish lines) ────────────────────────────
function loadMeal(PDO $db, int $id): ?array {
    $stmt = $db->prepare("SELECT * FROM bulk_meal_plans WHERE id=:id");
    $stmt->execute([':id' => $id]);
    $meal = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$meal) return null;

    $lines = $db->prepare(
        "SELECT bmd.id, bmd.dish_id, d.name AS dish_name, d.category, d.unit,
                bmd.num_people, bmd.required_quantity, bmd.total_cost,
                ROUND(d.bulk_price / d.serves_people, 2)    AS price_per_person,
                ROUND(d.bulk_quantity / d.serves_people, 4) AS qty_per_person
         FROM bulk_meal_dishes bmd
         JOIN dishes d ON d.id = bmd.dish_id
         WHERE bmd.bulk_meal_id = :id
         ORDER BY d.category, d.name"
    );
    $lines->execute([':id' => $id]);
    $meal['dishes']      = $lines->fetchAll(PDO::FETCH_ASSOC);
    $meal['id']          = (int)$meal['id'];
    $meal['num_people']  = (int)$meal['num_people'];
    $meal['grand_total'] = (float)$meal['grand_total'];
    $meal['is_active']   = (bool)$meal['is_active'];
    foreach ($meal['dishes'] as &$dl) {
        $dl['id']                = (int)$dl['id'];
        $dl['dish_id']           = (int)$dl['dish_id'];
        $dl['num_people']        = (int)$dl['num_people'];
        $dl['required_quantity'] = (float)$dl['required_quantity'];
        $dl['total_cost']        = (float)$dl['total_cost'];
        $dl['price_per_person']  = (float)$dl['price_per_person'];
        $dl['qty_per_person']    = (float)$dl['qty_per_person'];
    }
    return $meal;
}

require_once __DIR__ . '/../../config/database_sqlite.php';
$database = new Database();
$db       = $database->getConnection();
$method   = $_SERVER['REQUEST_METHOD'];

try {
    requireAdmin($db);

    switch ($method) {

        // ── LIST ──────────────────────────────────────────────────────────────
        case 'GET':
            if (isset($_GET['id'])) {
                $meal = loadMeal($db, (int)$_GET['id']);
                if (!$meal) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Not found']); break; }
                echo json_encode(['success'=>true,'data'=>$meal]);
                break;
            }
            $stmt = $db->query(
                "SELECT id, name, occasion, meal_type, num_people, grand_total, notes, is_active, created_at
                 FROM bulk_meal_plans ORDER BY created_at DESC"
            );
            $rows = array_map(function($r) {
                return array_merge($r, [
                    'id'          => (int)$r['id'],
                    'num_people'  => (int)$r['num_people'],
                    'grand_total' => (float)$r['grand_total'],
                    'is_active'   => (bool)$r['is_active'],
                ]);
            }, $stmt->fetchAll(PDO::FETCH_ASSOC));
            echo json_encode(['success'=>true,'data'=>$rows]);
            break;

        // ── CREATE ────────────────────────────────────────────────────────────
        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty(trim($body['name'] ?? '')))     { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Name required']); break; }
            if (empty(trim($body['occasion'] ?? ''))) { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Occasion required']); break; }
            if (empty(trim($body['meal_type'] ?? ''))) { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Meal type required']); break; }
            if (!is_numeric($body['num_people'] ?? '') || (int)$body['num_people'] < 1) {
                http_response_code(422); echo json_encode(['success'=>false,'message'=>'num_people must be ≥ 1']); break;
            }
            $dishes = $body['dishes'] ?? [];

            $db->beginTransaction();
            $ins = $db->prepare(
                "INSERT INTO bulk_meal_plans (name, occasion, meal_type, num_people, grand_total, notes, is_active)
                 VALUES (:name, :occ, :mt, :np, 0, :notes, 1)"
            );
            $ins->execute([
                ':name'  => trim($body['name']),
                ':occ'   => trim($body['occasion']),
                ':mt'    => trim($body['meal_type']),
                ':np'    => (int)$body['num_people'],
                ':notes' => trim($body['notes'] ?? ''),
            ]);
            $mealId     = (int)$db->lastInsertId();
            $grandTotal = syncDishes($db, $mealId, $dishes);
            $db->prepare("UPDATE bulk_meal_plans SET grand_total=:gt WHERE id=:id")->execute([':gt'=>$grandTotal,':id'=>$mealId]);
            $db->commit();

            echo json_encode(['success'=>true,'message'=>'Meal plan created.','data'=>loadMeal($db,$mealId)]);
            break;

        // ── UPDATE ────────────────────────────────────────────────────────────
        case 'PUT':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $id   = (int)($body['id'] ?? 0);
            if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id required']); break; }
            if (empty(trim($body['name'] ?? '')))     { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Name required']); break; }
            if (empty(trim($body['occasion'] ?? ''))) { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Occasion required']); break; }
            if (empty(trim($body['meal_type'] ?? ''))) { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Meal type required']); break; }
            if (!is_numeric($body['num_people'] ?? '') || (int)$body['num_people'] < 1) {
                http_response_code(422); echo json_encode(['success'=>false,'message'=>'num_people must be ≥ 1']); break;
            }
            $dishes = $body['dishes'] ?? [];

            $db->beginTransaction();
            $upd = $db->prepare(
                "UPDATE bulk_meal_plans SET name=:name, occasion=:occ, meal_type=:mt,
                 num_people=:np, notes=:notes, updated_at=DATETIME('now') WHERE id=:id"
            );
            $upd->execute([
                ':name'  => trim($body['name']),
                ':occ'   => trim($body['occasion']),
                ':mt'    => trim($body['meal_type']),
                ':np'    => (int)$body['num_people'],
                ':notes' => trim($body['notes'] ?? ''),
                ':id'    => $id,
            ]);
            $grandTotal = syncDishes($db, $id, $dishes);
            $db->prepare("UPDATE bulk_meal_plans SET grand_total=:gt WHERE id=:id")->execute([':gt'=>$grandTotal,':id'=>$id]);
            $db->commit();

            echo json_encode(['success'=>true,'message'=>'Meal plan updated.','data'=>loadMeal($db,$id)]);
            break;

        // ── DELETE ────────────────────────────────────────────────────────────
        case 'DELETE':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $id   = (int)($body['id'] ?? 0);
            if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id required']); break; }
            // Cascade deletes dish lines via FK
            $db->prepare("DELETE FROM bulk_meal_plans WHERE id=:id")->execute([':id'=>$id]);
            echo json_encode(['success'=>true,'message'=>'Meal plan deleted.']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success'=>false,'message'=>'Method not allowed']);
    }
} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Database error: '.$e->getMessage()]);
}
?>
