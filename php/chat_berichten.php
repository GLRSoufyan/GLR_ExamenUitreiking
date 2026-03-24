<?php
/* =====================================================
   chat_berichten.php - Haal chat berichten op
   Wordt elke 3 seconden aangeroepen door de app
   ===================================================== */

require_once 'db.php';
jsonHeader();

// Controleer of de gebruiker is ingelogd
if (!getGebruikersRol()) {
  http_response_code(401);
  echo json_encode(['fout' => 'Niet ingelogd']);
  exit;
}

$pdo = dbVerbinding();

// 'vanaf' geeft aan hoeveel berichten de client al heeft
// Zo sturen we alleen NIEUWE berichten terug (efficienter)
$vanaf = isset($_GET['vanaf']) ? (int) $_GET['vanaf'] : 0;

try {
  // Haal de nieuwste berichten op, maar max 50
  // We skippen verwijderde berichten (verwijderd = 0)
  $stmt = $pdo->prepare("
    SELECT id, naam, tekst, is_admin, gestuurd_op
    FROM chat_berichten
    WHERE verwijderd = 0
    ORDER BY gestuurd_op ASC
    LIMIT 50
    OFFSET :vanaf
  ");
  $stmt->bindValue(':vanaf', $vanaf, PDO::PARAM_INT);
  $stmt->execute();
  $berichten = $stmt->fetchAll();

  // Aantal actieve kijkers schatten op basis van recente berichten
  // Dit is een simpele benadering
  $stmt2 = $pdo->query("
    SELECT COUNT(DISTINCT ip_adres) as kijkers
    FROM chat_berichten
    WHERE gestuurd_op >= NOW() - INTERVAL 5 MINUTE
  ");
  $kijkers = $stmt2->fetchColumn() ?: 1;

  echo json_encode([
    'berichten' => $berichten,
    'kijkers'   => $kijkers
  ]);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['fout' => 'Kon berichten niet ophalen']);
}
?>
