<?php
/* admin_chat.php - Alle berichten voor moderatie */
require_once 'db.php';
jsonHeader();
if (!isAdmin()) { http_response_code(403); echo json_encode(['fout' => 'Geen toegang']); exit; }
$pdo = dbVerbinding();
try {
  $stmt = $pdo->query("SELECT id, naam, tekst, is_admin, gestuurd_op FROM chat_berichten WHERE verwijderd = 0 ORDER BY gestuurd_op DESC LIMIT 100");
  echo json_encode(['berichten' => $stmt->fetchAll()]);
} catch (PDOException $e) {
  http_response_code(500); echo json_encode(['fout' => 'Mislukt']);
}
?>
