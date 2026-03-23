<?php
// Health check endpoint — access at /fooddash/backend/api/health.php
// DELETE THIS FILE after confirming the server is working.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database_sqlite.php';

$results = [];
$results['php_version'] = PHP_VERSION;
$results['php_ok']      = version_compare(PHP_VERSION, '7.4.0', '>=');

$driver = strtolower(getenv('DB_DRIVER') ?: 'sqlite');
$results['db_driver'] = $driver;

if ($driver === 'mysql') {
    $results['pdo_mysql'] = extension_loaded('pdo_mysql');
    try {
        $db = (new Database())->getConnection();
        $row = $db->query("SELECT COUNT(*) AS cnt FROM users")->fetch(PDO::FETCH_ASSOC);
        $results['mysql_connection'] = 'OK';
        $results['users_count']      = (int)$row['cnt'];
    } catch (Exception $e) {
        $results['mysql_connection'] = 'FAILED: ' . $e->getMessage();
    }
} else {
    $results['pdo_sqlite'] = extension_loaded('pdo_sqlite');
    $dbDir  = dirname(__DIR__) . '/database';
    $results['db_dir_exists']   = is_dir($dbDir);
    $results['db_dir_writable'] = is_writable($dbDir);
    try {
        $db = (new Database())->getConnection();
        $results['sqlite_connection'] = 'OK';
    } catch (Exception $e) {
        $results['sqlite_connection'] = 'FAILED: ' . $e->getMessage();
    }
}

$ok = $results['php_ok'] &&
    (isset($results['mysql_connection'])  ? $results['mysql_connection']  === 'OK' : true) &&
    (isset($results['sqlite_connection']) ? $results['sqlite_connection'] === 'OK' : true);

$results['status'] = $ok ? 'READY' : 'CHECK_ERRORS';
$results['script_path'] = __FILE__;

http_response_code($ok ? 200 : 500);
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
