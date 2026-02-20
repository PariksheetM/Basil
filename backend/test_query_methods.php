<?php
$dbPath = __DIR__ . '/database/food_ordering.db';
$db = new PDO("sqlite:" . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$email = 'newuser2@example.com';

// Method 1: Using bindValue
echo "Method 1: bindValue with :email\n";
$stmt1 = $db->prepare("SELECT id, email FROM users WHERE email = :email");
$stmt1->bindValue(":email", $email, PDO::PARAM_STR);
$stmt1->execute();
echo "  Rows: " . $stmt1->rowCount() . "\n";
if ($row = $stmt1->fetch()) {
    echo "  Found: {$row['email']}\n";
}

// Method 2: Using execute array
echo "\nMethod 2: execute with array\n";
$stmt2 = $db->prepare("SELECT id, email FROM users WHERE email = ?");
$stmt2->execute([$email]);
echo "  Rows: " . $stmt2->rowCount() . "\n";
if ($row = $stmt2->fetch()) {
    echo "  Found: {$row['email']}\n";
}

// Method 3: Direct query
echo "\nMethod 3: Direct query\n";
$stmt3 = $db->query("SELECT id, email FROM users WHERE email = 'newuser2@example.com'");
echo "  Rows: " . $stmt3->rowCount() . "\n";
if ($row = $stmt3->fetch()) {
    echo "  Found: {$row['email']}\n";
}

// Check all emails
echo "\nAll users:\n";
$all = $db->query("SELECT id, email FROM users")->fetchAll();
foreach ($all as $u) {
    echo "  {$u['id']}: {$u['email']}\n";
}
?>
