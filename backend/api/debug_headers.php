<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

// Debug: Show all headers received
$debug = [
    'php_sapi' => php_sapi_name(),
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'N/A',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'all_headers_method1' => [],
    'all_headers_method2' => [],
    'authorization_via_apache' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET',
    'php_auth_user' => $_SERVER['PHP_AUTH_USER'] ?? 'NOT SET',
    'php_auth_pw' => $_SERVER['PHP_AUTH_PW'] ?? 'NOT SET',
];

// Method 1: Using getallheaders()
if (function_exists('getallheaders')) {
    $debug['all_headers_method1'] = getallheaders();
} else {
    $debug['getallheaders_available'] = false;
}

// Method 2: Using $_SERVER directly
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $headerName = str_replace('HTTP_', '', $key);
        $debug['all_headers_method2'][$headerName] = $value;
    }
}

echo json_encode($debug);
?>
