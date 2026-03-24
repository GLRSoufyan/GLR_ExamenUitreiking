-- =====================================================
-- GLR Diploma-uitreiking 2025 — Database Schema
-- Importeer dit bestand in PHPMyAdmin
-- Maak eerst de database aan: glr_diploma
-- =====================================================

-- Zorg dat we de goede database gebruiken
CREATE DATABASE IF NOT EXISTS `glr_diploma`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `glr_diploma`;

-- =====================================================
-- Tabel: posts
-- Voor de berichten op de home pagina
-- =====================================================
CREATE TABLE IF NOT EXISTS `posts` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `titel`       VARCHAR(255)  NOT NULL,
  `tekst`       TEXT          NOT NULL,
  `auteur`      VARCHAR(100)  NOT NULL DEFAULT 'Grafisch Lyceum',
  `likes`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `gemaakt_op`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actief`      TINYINT(1)    NOT NULL DEFAULT 1   -- 0 = verborgen, 1 = zichtbaar
) ENGINE=InnoDB;

-- Paar standaard posts toevoegen
INSERT INTO `posts` (`titel`, `tekst`, `auteur`, `likes`) VALUES
('Welkom bij de Diploma-uitreiking!', 'Vandaag is de grote dag! Alle examenkandidaten van GLR worden in het zonnetje gezet. We zijn trots op jullie allemaal!', 'Grafisch Lyceum', 47),
('Programma van vandaag', '📋 Tijden: 13:30 inloop | 14:00 openingswoord | 14:30 diploma-uitreiking | 15:30 receptie. Vergeet niet je diploma te tekenen!', 'Grafisch Lyceum', 23),
('School is tijdelijk, de herinnering is voor altijd', 'Morgen is het zover! Zorg dat je er klaar voor bent. GLR is trots op jullie prestaties.', 'Grafisch Lyceum', 89);

-- =====================================================
-- Tabel: post_likes
-- Bijhouden wie een post heeft geliked (op basis van IP)
-- =====================================================
CREATE TABLE IF NOT EXISTS `post_likes` (
  `id`       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `post_id`  INT UNSIGNED NOT NULL,
  `ip_adres` VARCHAR(45)  NOT NULL,   -- IPv4 en IPv6 ondersteuning
  `gelikt_op` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniek_like` (`post_id`, `ip_adres`)  -- Iedereen kan maar 1 keer liken
) ENGINE=InnoDB;

-- =====================================================
-- Tabel: fotos
-- Alle geuploadde foto's per klas
-- =====================================================
CREATE TABLE IF NOT EXISTS `fotos` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `bestandsnaam` VARCHAR(255) NOT NULL,
  `originele_naam` VARCHAR(255) NOT NULL,
  `klas`        VARCHAR(50)  NOT NULL,
  `geupload_op` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actief`      TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Index voor sneller opzoeken op klas
CREATE INDEX `idx_fotos_klas` ON `fotos` (`klas`);
CREATE INDEX `idx_fotos_actief` ON `fotos` (`actief`);

-- =====================================================
-- Tabel: chat_berichten
-- Live chat berichten tijdens de uitzending
-- =====================================================
CREATE TABLE IF NOT EXISTS `chat_berichten` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `naam`         VARCHAR(100) NOT NULL,
  `tekst`        VARCHAR(500) NOT NULL,
  `is_admin`     TINYINT(1)   NOT NULL DEFAULT 0,
  `ip_adres`     VARCHAR(45)  NOT NULL,
  `gestuurd_op`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verwijderd`   TINYINT(1)   NOT NULL DEFAULT 0  -- Soft delete
) ENGINE=InnoDB;

-- Index voor sneller laden van nieuwe berichten
CREATE INDEX `idx_chat_tijd` ON `chat_berichten` (`gestuurd_op`);

-- Systeem welkomstbericht toevoegen
INSERT INTO `chat_berichten` (`naam`, `tekst`, `is_admin`, `ip_adres`) VALUES
('Systeem', 'Welkom in de live chat! Wees vriendelijk tegen elkaar. 😊', 1, '127.0.0.1');

-- =====================================================
-- Tabel: instellingen
-- Sla app-instellingen op zoals het Vimeo ID
-- =====================================================
CREATE TABLE IF NOT EXISTS `instellingen` (
  `sleutel`  VARCHAR(100) PRIMARY KEY,
  `waarde`   TEXT NOT NULL,
  `bijgewerkt_op` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Standaard Vimeo video ID instellen
INSERT INTO `instellingen` (`sleutel`, `waarde`) VALUES
('vimeo_id', '76979871'),  -- Dit is een demo ID, aanpassen naar echte stream!
('site_actief', '1');

-- =====================================================
-- Aangemaakt! Klaar voor gebruik.
-- Vergeet niet de inloggegevens in db.php aan te passen.
-- =====================================================
