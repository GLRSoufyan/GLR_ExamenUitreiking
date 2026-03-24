<?php
/* =====================================================
   fotos_ophalen.php - Haal alle foto's op voor galerij
   Geeft fotos terug gesorteerd op klas
   ===================================================== */

require_once 'db.php';
jsonHeader();

// Moet ingelogd zijn om fotos te zien
if (!getGebruikersRol()) {
  http_response_code(401);
  echo json_encode(['fout' => 'Niet ingelogd']);
  exit;
}

$pdo = dbVerbinding();

try {
  // Haal alle actieve fotos op
  $stmt = $pdo->query("
    SELECT id, bestandsnaam, originele_naam, klas, geupload_op
    FROM fotos
    WHERE actief = 1
    ORDER BY klas ASC, geupload_op DESC
  ");
  $fotosRaw = $stmt->fetchAll();

  // Maak een nette array met het juiste pad
  $fotos = array_map(function($foto) {
    return [
      'id'    => $foto['id'],
      'naam'  => $foto['originele_naam'],
      'pad'   => 'uploads/photos/' . $foto['bestandsnaam'],
      'klas'  => $foto['klas'],
      'datum' => $foto['geupload_op']
    ];
  }, $fotosRaw);

  // Unieke klassen voor de filter knoppen
  $klassen = array_unique(array_column($fotos, 'klas'));
  sort($klassen);

  echo json_encode([
    'fotos'   => $fotos,
    'klassen' => array_values($klassen)
  ]);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['fout' => 'Kon foto\'s niet ophalen']);
}
?>
