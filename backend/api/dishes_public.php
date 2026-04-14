<?php
// Public: list all active dishes (no auth required)
// GET /api/dishes_public.php

require_once '../config/database_sqlite.php';

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://basil-five.vercel.app',
    'https://qsr.catalystsolutions.eco',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit(); }

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->query(
        "SELECT id, name, category, description, image, type
         FROM dishes
         WHERE is_active = 1
         ORDER BY category, name"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $rows = array_map(function ($r) {
        return [
            'id'          => (int)$r['id'],
            'name'        => $r['name'],
            'category'    => $r['category'],
            'description' => $r['description'],
            'image'       => $r['image'],
            'type'        => $r['type'] ?? 'veg',
        ];
    }, $rows);

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
