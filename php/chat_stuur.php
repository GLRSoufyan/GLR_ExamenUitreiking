<?php
/* =====================================================
   chat_stuur.php - Verstuur een chat bericht
   Wordt aangeroepen als iemand een bericht stuurt
   ===================================================== */

require_once 'db.php';
jsonHeader();

// Alleen POST verzoeken accepteren
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['fout' => 'Alleen POST toegestaan']);
  exit;
}

// Moet ingelogd zijn om te chatten
if (!getGebruikersRol()) {
  http_response_code(401);
  echo json_encode(['fout' => 'Niet ingelogd']);
  exit;
}

// JSON data lezen
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
  http_response_code(400);
  echo json_encode(['fout' => 'Ongeldige data']);
  exit;
}

// Invoer valideren en schoonmaken
$naam = trim($data['naam'] ?? '');
$tekst = trim($data['tekst'] ?? '');
$isAdmin = (bool) ($data['is_admin'] ?? false);

// Minimale validatie
if (empty($naam) || empty($tekst)) {
  http_response_code(400);
  echo json_encode(['fout' => 'Naam en tekst zijn verplicht']);
  exit;
}

// Maximum lengte bewaken
$naam = mb_substr($naam, 0, 100);
$tekst = mb_substr($tekst, 0, 500);

// IP adres ophalen voor spam preventie
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ip = explode(',', $ip)[0]; // Bij meerdere IPs, eerste nemen
$ip = filter_var(trim($ip), FILTER_VALIDATE_IP) ?: '0.0.0.0';

// Simpele spam check: max 5 berichten per minuut per IP
$pdo = dbVerbinding();

$spamCheck = $pdo->prepare("
  SELECT COUNT(*) FROM chat_berichten
  WHERE ip_adres = :ip
  AND gestuurd_op >= NOW() - INTERVAL 1 MINUTE
");
$spamCheck->execute([':ip' => $ip]);
$aantalRecent = $spamCheck->fetchColumn();

if ($aantalRecent >= 5) {
  http_response_code(429);
  echo json_encode(['fout' => 'Te veel berichten, wacht even!']);
  exit;
}

// Bericht opslaan in database
try {
  $stmt = $pdo->prepare("
    INSERT INTO chat_berichten (naam, tekst, is_admin, ip_adres)
    VALUES (:naam, :tekst, :is_admin, :ip)
  ");

  $stmt->execute([
    ':naam'     => $naam,
    ':tekst'    => $tekst,
    ':is_admin' => $isAdmin ? 1 : 0,
    ':ip'       => $ip
  ]);

  echo json_encode(['succes' => true, 'id' => $pdo->lastInsertId()]);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['fout' => 'Bericht kon niet opgeslagen worden']);
}
?>
