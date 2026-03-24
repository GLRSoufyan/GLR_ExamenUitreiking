<?php
/* =====================================================
   post_aanmaken.php - Maak een nieuwe post (admin only)
   ===================================================== */

require_once 'db.php';
jsonHeader();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); echo json_encode(['fout' => 'Alleen POST']); exit;
}

if (!isAdmin()) {
  http_response_code(403); echo json_encode(['fout' => 'Geen toegang']); exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$titel = trim($data['titel'] ?? '');
$tekst = trim($data['tekst'] ?? '');

if (!$titel || !$tekst) {
  http_response_code(400); echo json_encode(['fout' => 'Titel en tekst verplicht']); exit;
}

// Maximale lengte afdwingen
$titel = mb_substr($titel, 0, 255);
$tekst = mb_substr($tekst, 0, 5000);

$pdo = dbVerbinding();

try {
  $stmt = $pdo->prepare("INSERT INTO posts (titel, tekst, auteur) VALUES (:titel, :tekst, 'Admin')");
  $stmt->execute([':titel' => $titel, ':tekst' => $tekst]);
  echo json_encode(['succes' => true, 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['fout' => 'Post kon niet aangemaakt worden']);
}
?>
