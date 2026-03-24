<?php
/* stream_update.php - Vimeo ID opslaan (admin only) */
require_once 'db.php';
jsonHeader();
if (!isAdmin()) { http_response_code(403); echo json_encode(['fout' => 'Geen toegang']); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$vimeoId = preg_replace('/[^0-9]/', '', $data['vimeo_id'] ?? '');
if (!$vimeoId) { http_response_code(400); echo json_encode(['fout' => 'Ongeldig ID']); exit; }
$pdo = dbVerbinding();
try {
  $stmt = $pdo->prepare("INSERT INTO instellingen (sleutel, waarde) VALUES ('vimeo_id', :id) ON DUPLICATE KEY UPDATE waarde = :id2");
  $stmt->execute([':id' => $vimeoId, ':id2' => $vimeoId]);
  echo json_encode(['succes' => true]);
} catch (PDOException $e) {
  http_response_code(500); echo json_encode(['fout' => 'Opslaan mislukt']);
}
?>
