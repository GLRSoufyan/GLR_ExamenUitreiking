<?php
/* chat_wis.php - Wis alle chat berichten (admin only) */
require_once 'db.php';
jsonHeader();
if (!isAdmin()) { http_response_code(403); echo json_encode(['fout' => 'Geen toegang']); exit; }
$pdo = dbVerbinding();
try {
  $pdo->exec("UPDATE chat_berichten SET verwijderd = 1 WHERE is_admin = 0");
  echo json_encode(['succes' => true]);
} catch (PDOException $e) {
  http_response_code(500); echo json_encode(['fout' => 'Mislukt']);
}
?>
