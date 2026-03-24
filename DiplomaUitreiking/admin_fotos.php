<?php
/* admin_fotos.php - Lijst van alle fotos voor admin */
require_once 'db.php';
jsonHeader();
if (!isAdmin()) { http_response_code(403); echo json_encode(['fout' => 'Geen toegang']); exit; }
$pdo = dbVerbinding();
try {
  $stmt = $pdo->query("SELECT id, originele_naam as naam, klas, geupload_op as datum FROM fotos WHERE actief = 1 ORDER BY geupload_op DESC");
  echo json_encode(['fotos' => $stmt->fetchAll()]);
} catch (PDOException $e) {
  http_response_code(500); echo json_encode(['fout' => 'Mislukt']);
}
?>
