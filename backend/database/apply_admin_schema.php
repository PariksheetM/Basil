<?php
try {
    // Create database connection
    $dbPath = __DIR__ . '/food_ordering.db';
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read and execute admin schema
    $sql = file_get_contents(__DIR__ . '/schema_admin.sql');
    $db->exec($sql);
    
    echo "✅ Admin schema applied successfully!\n";
    echo "✅ Meal plans table created\n";
    echo "✅ Sample meal plans inserted\n";
    echo "✅ Orders table updated with occasion fields\n";
    echo "✅ Sample orders inserted\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
