<?php
/* =====================================================
   foto_upload.php - Foto's uploaden (alleen admin)
   Heeft veel beveiligingscontroles want file uploads
   zijn een bekende veiligheidsrisico!
   ===================================================== */

require_once 'db.php';
jsonHeader();

// Alleen admins mogen uploaden
if (!isAdmin()) {
  http_response_code(403);
  echo json_encode(['fout' => 'Geen toegang, alleen admins kunnen uploaden']);
  exit;
}

// Klas naam ophalen en valideren
$klas = trim($_POST['klas'] ?? '');
if (empty($klas)) {
  http_response_code(400);
  echo json_encode(['fout' => 'Klas naam is verplicht']);
  exit;
}

// Klas naam schoonmaken - alleen letters, cijfers en koppeltekens
$klas = preg_replace('/[^a-zA-Z0-9\-_]/', '', $klas);
$klas = mb_substr($klas, 0, 50);

if (empty($klas)) {
  http_response_code(400);
  echo json_encode(['fout' => 'Ongeldige klas naam']);
  exit;
}

// Controleer of er bestanden zijn
if (empty($_FILES['fotos'])) {
  http_response_code(400);
  echo json_encode(['fout' => 'Geen bestanden ontvangen']);
  exit;
}

// Toegestane bestandstypen (MIME types)
// Controleren op MIME type is veiliger dan alleen extensie
$toegestaan = ['image/jpeg', 'image/png', 'image/webp'];

// Upload map - buiten de webroot is veiliger, maar hier voor eenvoud in uploads/
$uploadMap = __DIR__ . '/../uploads/photos/';

// Map aanmaken als die er nog niet is
if (!is_dir($uploadMap)) {
  mkdir($uploadMap, 0755, true);
}

$pdo = dbVerbinding();
$succesAantal = 0;
$fouten = [];

// Verwerk elk bestand
$bestanden = $_FILES['fotos'];
$aantalBestanden = count($bestanden['name']);

for ($i = 0; $i < $aantalBestanden; $i++) {
  // Controleer of er geen upload fout was
  if ($bestanden['error'][$i] !== UPLOAD_ERR_OK) {
    $fouten[] = $bestanden['name'][$i] . ': upload fout';
    continue;
  }

  $origineleNaam = $bestanden['name'][$i];
  $tijdelijkPad = $bestanden['tmp_name'][$i];
  $bestandsGrootte = $bestanden['size'][$i];

  // Grootte controleren (max 10MB)
  $maxGrootte = 10 * 1024 * 1024; // 10MB in bytes
  if ($bestandsGrootte > $maxGrootte) {
    $fouten[] = $origineleNaam . ': te groot (max 10MB)';
    continue;
  }

  // MIME type controleren - NIET vertrouwen op extensie!
  // finfo geeft het echte bestandstype terug
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mimeType = $finfo->file($tijdelijkPad);

  if (!in_array($mimeType, $toegestaan)) {
    $fouten[] = $origineleNaam . ': ongeldig bestandstype';
    continue;
  }

  // Extra controle: is het echt een afbeelding?
  $afbeeldingInfo = getimagesize($tijdelijkPad);
  if ($afbeeldingInfo === false) {
    $fouten[] = $origineleNaam . ': geen geldige afbeelding';
    continue;
  }

  // Genereer een veilige unieke bestandsnaam
  // We gebruiken NOOIT de originele naam direct - te gevaarlijk!
  $extensies = [
    'image/jpeg' => '.jpg',
    'image/png'  => '.png',
    'image/webp' => '.webp'
  ];
  $extensie = $extensies[$mimeType];
  $nieuweNaam = foto_upload . phpuniqid('foto_', true) . $extensie;
  $doeluPad = $uploadMap . $nieuweNaam;

  // Bestand verplaatsen naar uploads map
  if (move_uploaded_file($tijdelijkPad, $doeluPad)) {
    // Opslaan in database
    try {
      $stmt = $pdo->prepare("
        INSERT INTO fotos (bestandsnaam, originele_naam, klas)
        VALUES (:bestandsnaam, :originele_naam, :klas)
      ");
      $stmt->execute([
        ':bestandsnaam'   => $nieuweNaam,
        ':originele_naam' => $origineleNaam,
        ':klas'           => $klas
      ]);
      $succesAantal++;
    } catch (PDOException $e) {
      // Database fout - verwijder het bestand weer
      unlink($doeluPad);
      $fouten[] = $origineleNaam . ': database fout';
    }
  } else {
    $fouten[] = $origineleNaam . ': kon niet opslaan';
  }
}

// Resultaat terugsturen
echo json_encode([
  'succes' => $succesAantal > 0,
  'aantal' => $succesAantal,
  'fouten' => $fouten
]);
?>
