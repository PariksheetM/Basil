<?php
// Test database connectivity and data
$dbPath = __DIR__ . '/database/food_ordering.db';

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✓ Database connection successful\n\n";
    
    // Check tables
    $result = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "✗ No tables found! Database is empty.\n";
        echo "Running schema...\n\n";
        
        $schemaFile = __DIR__ . '/database/schema_sqlite.sql';
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            $db->exec($sql);
            echo "✓ Schema executed successfully!\n\n";
            
            // Re-check tables
            $result = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
            $tables = $result->fetchAll(PDO::FETCH_COLUMN);
        }
    }
    
    echo "Tables found: " . implode(', ', $tables) . "\n\n";
    
    // Check data in each table
    foreach ($tables as $table) {
        $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "$table: $count rows\n";
        
        if ($table === 'menu_items' && $count > 0) {
            echo "\nSample menu items:\n";
            $items = $db->query("SELECT id, name, price FROM menu_items LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                echo "  - {$item['name']} (₹{$item['price']})\n";
            }
        }
    }
    
} catch(PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
?>
