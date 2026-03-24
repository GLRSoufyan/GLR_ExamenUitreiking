<?php
/* =====================================================
   post_like.php - Like of unlike een post
   Iedereen die ingelogd is kan liken
   We gebruiken IP om dubbele likes te voorkomen
   ===================================================== */

require_once 'db.php';
jsonHeader();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['fout' => 'Alleen POST']);
  exit;
}

if (!getGebruikersRol()) {
  http_response_code(401);
  echo json_encode(['fout' => 'Niet ingelogd']);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$postId = (int) ($data['post_id'] ?? 0);
$actie = $data['actie'] ?? 'like'; // 'like' of 'unlike'

if (!$postId) {
  http_response_code(400);
  echo json_encode(['fout' => 'Geen geldig post ID']);
  exit;
}

// IP adres ophalen
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ip = explode(',', $ip)[0];
$ip = filter_var(trim($ip), FILTER_VALIDATE_IP) ?: '0.0.0.0';

$pdo = dbVerbinding();

try {
  if ($actie === 'like') {
    // Voeg een like toe (IGNORE voorkomt dubbele likes)
    $stmt = $pdo->prepare("
      INSERT IGNORE INTO post_likes (post_id, ip_adres)
      VALUES (:post_id, :ip)
    ");
    $stmt->execute([':post_id' => $postId, ':ip' => $ip]);

    // Likes teller in posts tabel bijwerken
    if ($stmt->rowCount() > 0) {
      $pdo->prepare("UPDATE posts SET likes = likes + 1 WHERE id = :id")
          ->execute([':id' => $postId]);
    }
  } else {
    // Unlike
    $stmt = $pdo->prepare("
      DELETE FROM post_likes
      WHERE post_id = :post_id AND ip_adres = :ip
    ");
    $stmt->execute([':post_id' => $postId, ':ip' => $ip]);

    if ($stmt->rowCount() > 0) {
      $pdo->prepare("UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = :id")
          ->execute([':id' => $postId]);
    }
  }

  // Huidig aantal likes terugsturen
  $stmt3 = $pdo->prepare("SELECT likes FROM posts WHERE id = :id");
  $stmt3->execute([':id' => $postId]);
  $likes = $stmt3->fetchColumn();

  echo json_encode(['succes' => true, 'likes' => $likes]);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['fout' => 'Like kon niet worden opgeslagen']);
}
?>
