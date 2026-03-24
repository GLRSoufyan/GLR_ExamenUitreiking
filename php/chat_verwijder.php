<?php
/* chat_verwijder.php - Verwijder een enkel bericht (admin only) */
require_once 'db.php';
jsonHeader();
if (!isAdmin()) { http_response_code(403); echo json_encode(['fout' => 'Geen toegang']); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$id = (int)($data['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['fout' => 'Geen ID']); exit; }
$pdo = dbVerbinding();
try {
  $stmt = $pdo->prepare("UPDATE chat_berichten SET verwijderd = 1 WHERE id = :id");
  $stmt->execute([':id' => $id]);
  echo json_encode(['succes' => true]);
} catch (PDOException $e) {
  http_response_code(500); echo json_encode(['fout' => 'Mislukt']);
}
?>
