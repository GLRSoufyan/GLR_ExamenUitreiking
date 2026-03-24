<?php
/* =====================================================
   Database verbinding - GLR Diploma 2025
   Hier verbinden we met de MySQL database via PDO
   PDO is veiliger dan de oudere mysqli manier
   ===================================================== */

// Database instellingen - aanpassen naar jouw server!
define('DB_HOST', 'localhost');
define('DB_NAAM', 'glr_diploma');
define('DB_GEBRUIKER', 'root');       // Aanpassen!
define('DB_WACHTWOORD', '');          // Aanpassen!
define('DB_CHARSET', 'utf8mb4');

// Functie die een PDO verbinding teruggeeft
// We gebruiken een functie zodat we hem makkelijk kunnen aanroepen
function dbVerbinding(): PDO {
  static $pdo = null; // Bewaart de verbinding zodat we niet elke keer opnieuw verbinden

  if ($pdo === null) {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAAM . ";charset=" . DB_CHARSET;

    // PDO opties voor extra veiligheid en foutmeldingen
    $opties = [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // Gooit een foutmelding als er iets misgaat
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // Geeft altijd een array terug
      PDO::ATTR_EMULATE_PREPARES   => false,                    // Veiliger - gebrukt echte prepared statements
    ];

    try {
      $pdo = new PDO($dsn, DB_GEBRUIKER, DB_WACHTWOORD, $opties);
    } catch (PDOException $e) {
      // Geef NOOIT de echte foutmelding aan de gebruiker!
      // Dat is gevaarlijk want het laat database info zien
      http_response_code(500);
      echo json_encode(['fout' => 'Database verbinding mislukt']);
      exit;
    }
  }

  return $pdo;
}

// Zet de header zodat PHP weet dat we JSON terugsturen
function jsonHeader(): void {
  header('Content-Type: application/json');
  header('X-Content-Type-Options: nosniff');
}

// Controleer of iemand ingelogd is via sessie
// Geeft 'gebruiker' of 'admin' terug, of false als niet ingelogd
function getGebruikersRol(): string|false {
  session_start();
  return $_SESSION['rol'] ?? false;
}

// Controleer of de ingelogde gebruiker admin is
function isAdmin(): bool {
  $rol = getGebruikersRol();
  return $rol === 'admin';
}
?>
