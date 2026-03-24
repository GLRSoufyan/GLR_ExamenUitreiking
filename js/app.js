/* =====================================================
   GLR Diploma-uitreiking 2025 — Hoofd JavaScript
   Hier staat alle logica voor de app
   
   LET OP: Codes zijn hier in de JS voor demo.
   In echte versie komen codes uit PHP/database!
   ===================================================== */

// ---- APP STATUS ----
// Hier slaan we op welke pagina we zijn, of iemand admin is, etc.
const appStatus = {
  isIngelogd: false,
  isAdmin: false,
  huidigePagina: 'home',
  huidigeFotoIndex: 0,
  alleFotos: [],            // Alle fotos die geladen zijn
  gefilterdeFotos: [],      // Fotos na filter
  chatInterval: null,       // Voor polling van chat berichten
  gelaalFotos: new Set(),   // Welke fotos zijn al geliked (in localStorage)
  gelaalPosts: new Set()    // Welke posts zijn geliked door deze gebruiker
};

// ---- CODES ----
// In een echte app komen deze uit de database (PHP backend)
// Voor nu hardcoded als demo
const TOEGANGSCODES = {
  'TEST': 'gebruiker',    // Normale bezoeker
  'ADMIN': 'admin'        // Administrator
};

// Controleer de ingevoerde code bij login
function controleerCode() {
  const input = document.getElementById('toegangscode');
  const code = input.value.trim().toUpperCase();
  const fout = document.getElementById('foutmelding');

  // Kijk of de code geldig is
  if (TOEGANGSCODES[code]) {
    const rol = TOEGANGSCODES[code];
    appStatus.isIngelogd = true;
    appStatus.isAdmin = (rol === 'admin');

    // Sla login op in sessie zodat je niet opnieuw hoeft in te loggen
    sessionStorage.setItem('glr_ingelogd', 'true');
    sessionStorage.setItem('glr_rol', rol);

    // App laten zien en login scherm verbergen
    loginSucces();
  } else {
    // Foutmelding tonen
    fout.classList.remove('hidden');
    input.value = '';
    input.focus();
    // Na 3 seconden foutmelding weer weghalen
    setTimeout(() => fout.classList.add('hidden'), 3000);
  }
}

// Druk op Enter werkt ook als inloggen
document.getElementById('toegangscode').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') controleerCode();
});

// Wat er geburd als je succesvol inlogt
function loginSucces() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Admin functies zichtbaar maken
  if (appStatus.isAdmin) {
    document.getElementById('admin-nav-item').classList.remove('hidden');
    document.getElementById('admin-mobile-link').classList.remove('hidden');
    document.getElementById('post-toevoegen-sectie').classList.remove('hidden');
    document.getElementById('foto-upload-sectie').classList.remove('hidden');
    document.getElementById('chat-admin-tools').classList.remove('hidden');
  }

  // Begin met chat pollingen
  startChatPolling();
  
  // Fotos laden
  laadFotos();

  toonToast('Welkom! Geniet van de dag 🎓', 'success');
}

// Uitloggen - sessie verwijderen en pagina herladen
function uitloggen() {
  sessionStorage.removeItem('glr_ingelogd');
  sessionStorage.removeItem('glr_rol');
  appStatus.isIngelogd = false;

  // Stop chat polling
  if (appStatus.chatInterval) clearInterval(appStatus.chatInterval);

  // Pagina opnieuw laden zodat het login scherm komt
  location.reload();
}

// =====================================================
// NAVIGATIE TUSSEN PAGINAS
// =====================================================

// Navigeer naar een bepaalde pagina
function navigeerNaar(pagina) {
  // Verberg alle paginas
  document.querySelectorAll('.pagina').forEach(p => {
    p.classList.remove('actief');
  });

  // Laat de gewenste pagina zien
  const doelPagina = document.getElementById('pagina-' + pagina);
  if (doelPagina) {
    doelPagina.classList.add('actief');
    appStatus.huidigePagina = pagina;
  }

  // Actieve nav link updaten
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pagina) {
      link.classList.add('active');
    }
  });

  // Scroll naar boven bij paginawissel
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Extra dingen doen bij bepaalde paginas
  if (pagina === 'admin' && appStatus.isAdmin) {
    laadAdminPosts();
    laadAdminFotos();
  }
}

// Hamburger menu openen en sluiten
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

function sluitMenu() {
  document.getElementById('mobile-menu').classList.add('hidden');
}

// Sluit menu als je buiten klikt
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobile-menu');
  const hamburger = document.getElementById('hamburger');
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// =====================================================
// POSTS LIKEN
// =====================================================

// Laad welke posts al geliked zijn uit localStorage
function laadGelaalPosts() {
  const opgeslagen = localStorage.getItem('glr_geliked_posts');
  if (opgeslagen) {
    const lijst = JSON.parse(opgeslagen);
    lijst.forEach(id => appStatus.gelaalPosts.add(id));
  }
}

// Sla geliked posts op
function slaGelaalPostsOp() {
  localStorage.setItem('glr_geliked_posts', JSON.stringify([...appStatus.gelaalPosts]));
}

// Like of unlike een post - iedereen kan dit doen
function likePost(postId, knop) {
  const teller = document.getElementById('likes-' + postId);
  const hart = knop.querySelector('.like-hart');
  const isGeliked = knop.dataset.geliked === 'true';

  if (isGeliked) {
    // Unlike
    knop.dataset.geliked = 'false';
    knop.classList.remove('geliked');
    hart.textContent = '🤍';
    teller.textContent = parseInt(teller.textContent) - 1;
    appStatus.gelaalPosts.delete(postId);
  } else {
    // Like
    knop.dataset.geliked = 'true';
    knop.classList.add('geliked');
    hart.textContent = '❤️';
    teller.textContent = parseInt(teller.textContent) + 1;
    appStatus.gelaalPosts.add(postId);
    
    // Kleine hartjes animatie
    maakHartjesAnimatie(knop);
  }

  slaGelaalPostsOp();

  // Stuur like naar server (PHP)
  fetch('php/post_like.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId, actie: isGeliked ? 'unlike' : 'like' })
  }).catch(() => {
    // Geen server beschikbaar - demo modus
    console.log('Demo modus: like opgeslagen locaal');
  });
}

// Kleine visuele animatie bij liken
function maakHartjesAnimatie(element) {
  const hartje = document.createElement('span');
  hartje.textContent = '❤️';
  hartje.style.cssText = `
    position: fixed;
    pointer-events: none;
    font-size: 1.2rem;
    z-index: 9999;
    animation: hartje-omhoog 0.8s ease forwards;
  `;

  // Positie van de knop bepalen
  const rect = element.getBoundingClientRect();
  hartje.style.left = rect.left + 'px';
  hartje.style.top = rect.top + 'px';

  // CSS voor de animatie
  const stijl = document.createElement('style');
  stijl.textContent = `
    @keyframes hartje-omhoog {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
    }
  `;

  document.head.appendChild(stijl);
  document.body.appendChild(hartje);
  setTimeout(() => hartje.remove(), 800);
}

// Admin post toevoegen
function voegPostToe() {
  adminVoegPostToe();
}

function adminVoegPostToe() {
  const titelEl = document.getElementById('admin-post-titel') || document.getElementById('nieuwe-post-titel');
  const tekstEl = document.getElementById('admin-post-tekst') || document.getElementById('nieuwe-post-tekst');
  
  if (!titelEl || !tekstEl) return;
  
  const titel = titelEl.value.trim();
  const tekst = tekstEl.value.trim();

  if (!titel || !tekst) {
    toonToast('Vul een titel en tekst in!', 'error');
    return;
  }

  // Post naar server sturen (PHP)
  fetch('php/post_aanmaken.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titel, tekst })
  }).then(r => r.json()).then(data => {
    if (data.succes) {
      toonToast('Post geplaatst! ✅', 'success');
    }
  }).catch(() => {
    // Demo modus: voeg lokaal toe
    voegPostLokaalToe(titel, tekst);
    toonToast('Post geplaatst (demo)! ✅', 'success');
  });

  // Formulier leegmaken
  titelEl.value = '';
  tekstEl.value = '';
}

// In demo modus: post lokaal toevoegen aan de pagina
function voegPostLokaalToe(titel, tekst) {
  const container = document.getElementById('posts-container');
  const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  const id = Date.now();

  const kaart = document.createElement('article');
  kaart.className = 'post-kaart';
  kaart.dataset.postId = id;
  kaart.innerHTML = `
    <div class="post-header">
      <span class="post-auteur">⚙️ Admin</span>
      <span class="post-datum">${datum}</span>
    </div>
    <h3 class="post-titel">${titulo(titel)}</h3>
    <p class="post-tekst">${titulo(tekst)}</p>
    <div class="post-acties">
      <button class="like-btn" onclick="likePost(${id}, this)" data-geliked="false">
        <span class="like-hart">🤍</span>
        <span class="like-teller" id="likes-${id}">0</span>
      </button>
      <span class="post-deel-hint">Deel dit moment!</span>
    </div>
  `;

  // Bovenaan invoegen
  container.insertBefore(kaart, container.firstChild);
}

// HTML escapen zodat er geen XSS kan
function titulo(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// =====================================================
// FOTO GALERIJ
// =====================================================

// Fotos laden van de server
function laadFotos() {
  fetch('php/fotos_ophalen.php')
    .then(r => r.json())
    .then(data => {
      if (data.fotos && data.fotos.length > 0) {
        appStatus.alleFotos = data.fotos;
        toonFotos(data.fotos);
        bouwFotoFilters(data.klassen);
      }
    })
    .catch(() => {
      // Geen server - demo modus, laat placeholder zien
      console.log('Demo modus: geen fotos van server');
    });
}

// Fotos tonen in het grid
function toonFotos(fotos) {
  const grid = document.getElementById('foto-grid');
  const geenFotos = document.getElementById('geen-fotos-melding');

  if (!fotos || fotos.length === 0) {
    geenFotos.classList.remove('hidden');
    return;
  }

  geenFotos.classList.add('hidden');
  grid.innerHTML = '';
  appStatus.gefilterdeFotos = fotos;

  fotos.forEach((foto, index) => {
    const item = document.createElement('div');
    item.className = 'foto-item';
    item.innerHTML = `
      <img src="${foto.pad}" alt="${foto.naam}" loading="lazy" />
      <div class="foto-overlay">
        <span>🔍</span>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(index));
    grid.appendChild(item);
  });
}

// Filters bouwen op basis van klassen
function bouwFotoFilters(klassen) {
  if (!klassen || !klassen.length) return;

  const filterContainer = document.getElementById('foto-filters');
  filterContainer.innerHTML = '<button class="filter-btn actief" onclick="filterFotos(\'alle\', this)">Alle klassen</button>';

  klassen.forEach(klas => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = klas;
    btn.onclick = function() { filterFotos(klas, this); };
    filterContainer.appendChild(btn);
  });
}

// Filter fotos op klas
function filterFotos(klas, knop) {
  // Actieve knop updaten
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('actief'));
  if (knop) knop.classList.add('actief');

  if (klas === 'alle') {
    toonFotos(appStatus.alleFotos);
  } else {
    const gefilterd = appStatus.alleFotos.filter(f => f.klas === klas);
    toonFotos(gefilterd);
  }
}

// =====================================================
// LIGHTBOX (FOTO POPUP)
// =====================================================

function openLightbox(index) {
  appStatus.huidigeFotoIndex = index;
  const foto = appStatus.gefilterdeFotos[index];

  document.getElementById('lightbox-foto').src = foto.pad;
  document.getElementById('lightbox-download').href = foto.pad;
  document.getElementById('lightbox-naam').textContent = foto.naam + ' — ' + (foto.klas || '');
  document.getElementById('lightbox').classList.remove('hidden');

  // Body scrollen uitschakelen
  document.body.style.overflow = 'hidden';
}

function sluitLightbox(event) {
  // Alleen sluiten als op de achtergrond geklikt wordt, of de sluit knop
  if (event && event.target !== document.getElementById('lightbox') && !event.target.classList.contains('lightbox-sluit')) {
    return;
  }
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

// Volgende foto in lightbox
function volgendeFoto(event) {
  if (event) event.stopPropagation();
  if (appStatus.gefilterdeFotos.length === 0) return;
  const nieuw = (appStatus.huidigeFotoIndex + 1) % appStatus.gefilterdeFotos.length;
  openLightbox(nieuw);
}

// Vorige foto in lightbox
function vorigeFoto(event) {
  if (event) event.stopPropagation();
  if (appStatus.gefilterdeFotos.length === 0) return;
  const nieuw = (appStatus.huidigeFotoIndex - 1 + appStatus.gefilterdeFotos.length) % appStatus.gefilterdeFotos.length;
  openLightbox(nieuw);
}

// Pijltjestoetsen voor lightbox navigatie
document.addEventListener('keydown', function(e) {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('hidden')) {
    if (e.key === 'ArrowRight') volgendeFoto();
    if (e.key === 'ArrowLeft') vorigeFoto();
    if (e.key === 'Escape') {
      lb.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
});

// =====================================================
// FOTO UPLOAD (ADMIN)
// =====================================================

let geselecteerdeBestanden = []; // Opgeslagen bestanden die geupload worden

// Als foto bestanden gekozen worden
function fotoBestandenGekozen(event) {
  const bestanden = Array.from(event.target.files);
  verwerkFotobestanden(bestanden, 'upload-preview', 'upload-btn');
}

function adminFotoGekozen(event) {
  const bestanden = Array.from(event.target.files);
  verwerkFotobestanden(bestanden, 'admin-upload-preview', 'admin-upload-btn');
}

// Verwerk de gekozen bestanden en toon preview
function verwerkFotobestanden(bestanden, previewId, knopId) {
  geselecteerdeBestanden = bestanden;

  const preview = document.getElementById(previewId);
  const knop = document.getElementById(knopId);

  if (!bestanden.length) {
    preview.classList.add('hidden');
    knop.disabled = true;
    return;
  }

  preview.classList.remove('hidden');
  preview.innerHTML = '';

  bestanden.forEach(bestand => {
    // Alleen afbeeldingen accepteren
    if (!bestand.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.title = bestand.name;
      preview.appendChild(img);
    };
    reader.readAsDataURL(bestand);
  });

  knop.disabled = false;
}

// Drag and drop voor de upload zone
const dropzone = document.getElementById('upload-dropzone');
if (dropzone) {
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    const bestanden = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    verwerkFotobestanden(bestanden, 'upload-preview', 'upload-btn');
    // Zet ook de file input zodat de upload werkt
    const dt = new DataTransfer();
    bestanden.forEach(f => dt.items.add(f));
    document.getElementById('foto-bestanden').files = dt.files;
  });
}

// Upload de fotos naar de server
function uploadFotos() {
  const klas = document.getElementById('upload-klas').value.trim();
  adminUploadUitvoeren(klas, 'upload-voortgang', 'voortgang-vulling', 'voortgang-tekst');
}

function adminUploadFotos() {
  const klas = document.getElementById('admin-upload-klas').value.trim();
  adminUploadUitvoeren(klas, 'upload-voortgang', 'voortgang-vulling', 'voortgang-tekst');
}

function adminUploadUitvoeren(klas, voortgangId, vullingId, tekstId) {
  if (!klas) {
    toonToast('Vul eerst een klas naam in!', 'error');
    return;
  }

  if (!geselecteerdeBestanden.length) {
    toonToast('Geen bestanden geselecteerd', 'error');
    return;
  }

  // Voortgangs balk tonen
  const voortgang = document.getElementById(voortgangId);
  const vulling = document.getElementById(vullingId);
  const tekst = document.getElementById(tekstId);

  if (voortgang) voortgang.classList.remove('hidden');

  // FormData maken met alle bestanden
  const formData = new FormData();
  formData.append('klas', klas);
  geselecteerdeBestanden.forEach(bestand => {
    formData.append('fotos[]', bestand);
  });

  // Simuleer voortgang (echte voortgang vereist XMLHttpRequest)
  let voortgangPct = 0;
  const voortgangInterval = setInterval(() => {
    voortgangPct += 10;
    if (vulling) vulling.style.width = voortgangPct + '%';
    if (tekst) tekst.textContent = `Uploaden... ${voortgangPct}%`;
    if (voortgangPct >= 90) clearInterval(voortgangInterval);
  }, 200);

  // Stuur naar PHP
  fetch('php/foto_upload.php', {
    method: 'POST',
    body: formData
  })
  .then(r => r.json())
  .then(data => {
    clearInterval(voortgangInterval);
    if (vulling) vulling.style.width = '100%';

    if (data.succes) {
      toonToast(`${data.aantal} foto's succesvol geüpload! ✅`, 'success');
      geselecteerdeBestanden = [];
      laadFotos(); // Galerij herladen
    } else {
      toonToast('Upload mislukt: ' + (data.fout || 'onbekende fout'), 'error');
    }

    // Voortgangs balk verbergen na 2 sec
    setTimeout(() => {
      if (voortgang) voortgang.classList.add('hidden');
    }, 2000);
  })
  .catch(() => {
    clearInterval(voortgangInterval);
    toonToast('Demo modus: upload gesimuleerd ✅', 'info');
    if (voortgang) voortgang.classList.add('hidden');
    geselecteerdeBestanden = [];
  });
}

// =====================================================
// LIVE CHAT
// =====================================================

// Start met elke 3 seconden nieuwe berichten ophalen (polling)
function startChatPolling() {
  laadChatBerichten(); // Direct laden
  appStatus.chatInterval = setInterval(laadChatBerichten, 3000);
}

// Nieuwste chat berichten ophalen van server
function laadChatBerichten() {
  const container = document.getElementById('chat-berichten');
  const huidigAantal = container.querySelectorAll('.chat-bericht:not(.systeem)').length;

  fetch(`php/chat_berichten.php?vanaf=${huidigAantal}`)
    .then(r => r.json())
    .then(data => {
      if (data.berichten && data.berichten.length > 0) {
        data.berichten.forEach(bericht => {
          voegChatBerichtToe(bericht.naam, bericht.tekst, bericht.is_admin, bericht.id);
        });
      }

      // Aantal kijkers updaten
      if (data.kijkers !== undefined) {
        document.getElementById('chat-aanwezig').textContent = data.kijkers + ' kijkers';
      }

      // Admin chat lijst updaten als we in admin zijn
      if (appStatus.isAdmin && appStatus.huidigePagina === 'admin') {
        laadAdminChat();
      }
    })
    .catch(() => {
      // Geen server - demo modus stil falen
    });
}

// Voeg een bericht toe aan de chat
function voegChatBerichtToe(naam, tekst, isAdmin = false, id = null) {
  const container = document.getElementById('chat-berichten');
  const bericht = document.createElement('div');
  bericht.className = 'chat-bericht' + (isAdmin ? ' admin-bericht' : '');
  if (id) bericht.dataset.berichtId = id;

  bericht.innerHTML = `
    <span class="chat-naam ${isAdmin ? 'admin-naam' : ''}">${titulo(naam)}:</span>
    <span class="chat-tekst">${titulo(tekst)}</span>
    ${appStatus.isAdmin ? `<button onclick="verwijderChatBericht(${id})" class="btn-admin-klein" title="Verwijderen">✕</button>` : ''}
  `;

  container.appendChild(bericht);

  // Automatisch naar onderen scrollen
  container.scrollTop = container.scrollHeight;
}

// Bericht verzenden
function verstuurChatBericht() {
  const input = document.getElementById('chat-input');
  const tekst = input.value.trim();

  if (!tekst) return;

  // Naam is "Admin" of "Bezoeker"
  const naam = appStatus.isAdmin ? 'Admin (GLR)' : 'Bezoeker';

  // Stuur naar server
  fetch('php/chat_stuur.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      naam: naam,
      tekst: tekst,
      is_admin: appStatus.isAdmin
    })
  }).then(r => r.json()).then(data => {
    if (!data.succes) {
      toonToast('Bericht kon niet verstuurd worden', 'error');
    }
  }).catch(() => {
    // Demo modus - direct tonen
    voegChatBerichtToe(naam, tekst, appStatus.isAdmin);
  });

  input.value = '';
}

// Enter toets in chat
function chatEnterKey(event) {
  if (event.key === 'Enter') verstuurChatBericht();
}

// Admin: verwijder alle chat berichten
function chatVerwijderAlles() {
  if (!confirm('Weet je zeker dat je alle berichten wil wissen?')) return;

  fetch('php/chat_wis.php', { method: 'POST' })
    .then(() => {
      const container = document.getElementById('chat-berichten');
      // Alleen echte berichten verwijderen, systeem bericht laten staan
      container.querySelectorAll('.chat-bericht:not(.systeem)').forEach(b => b.remove());
      toonToast('Chat geleegd ✅', 'success');
    })
    .catch(() => {
      // Demo modus
      const container = document.getElementById('chat-berichten');
      container.querySelectorAll('.chat-bericht:not(.systeem)').forEach(b => b.remove());
      toonToast('Chat geleegd (demo) ✅', 'success');
    });
}

// Admin: verwijder een enkel bericht
function verwijderChatBericht(id) {
  fetch('php/chat_verwijder.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id })
  })
  .then(() => {
    const bericht = document.querySelector(`[data-bericht-id="${id}"]`);
    if (bericht) bericht.remove();
    toonToast('Bericht verwijderd ✅', 'success');
  })
  .catch(() => {
    const bericht = document.querySelector(`[data-bericht-id="${id}"]`);
    if (bericht) bericht.remove();
  });
}

// =====================================================
// VIMEO LIVESTREAM
// =====================================================

// Admin kan het video ID updaten
function updateVimeoLink() {
  const id = document.getElementById('vimeo-video-id').value.trim();
  if (!id || isNaN(id)) {
    toonToast('Vul een geldig Vimeo ID in!', 'error');
    return;
  }

  const player = document.getElementById('vimeo-player');
  const nieuweUrl = `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0`;
  player.src = nieuweUrl;

  // Opslaan op server
  fetch('php/stream_update.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vimeo_id: id })
  }).then(() => {
    toonToast('Vimeo link bijgewerkt! ✅', 'success');
  }).catch(() => {
    toonToast('Link bijgewerkt (demo) ✅', 'info');
  });
}

// =====================================================
// JAARBOEK
// =====================================================

// Jaarboek per klas openen
function openJaarboek(klas) {
  const grid = document.getElementById('jaarboek-grid');
  const detail = document.getElementById('jaarboek-detail');
  const titel = document.getElementById('jaarboek-detail-titel');
  const studentenContainer = document.getElementById('jaarboek-studenten');

  const klasNamen = {
    'MDIA': 'Media Vormgeven — MDIA4A & MDIA4B',
    'ICT': 'Software Development — SD4A & SD4B',
    'AV': 'AV-produkties — AVP4A'
  };

  titel.textContent = 'Jaarboek ' + (klasNamen[klas] || klas);
  grid.classList.add('hidden');
  detail.classList.remove('hidden');

  // Demo studenten laden (in echte app via PHP)
  const demoStudenten = [
    { naam: 'Emma de Vries', initialen: 'EV', quote: '"Eindelijk klaar!" 🎉' },
    { naam: 'Liam Janssen', initialen: 'LJ', quote: '"De toekomst roept!" 🚀' },
    { naam: 'Sophie Bakker', initialen: 'SB', quote: '"Nooit stoppen met leren" 📚' },
    { naam: 'Noah Peters', initialen: 'NP', quote: '"Next stop: de wereld" 🌍' },
    { naam: 'Olivia van Dam', initialen: 'OD', quote: '"Best klas ooit!" ✨' },
    { naam: 'Finn Smit', initialen: 'FS', quote: '"GLR forever!" 💚' },
    { naam: 'Ava Visser', initialen: 'AV', quote: '"Dankjewel iedereen!" 🙏' },
    { naam: 'Lucas Mulder', initialen: 'LM', quote: '"Keihard gewerkt!" 💪' }
  ];

  studentenContainer.innerHTML = '';
  demoStudenten.forEach(student => {
    const kaart = document.createElement('div');
    kaart.className = 'student-kaart';
    kaart.innerHTML = `
      <div class="student-avatar">${student.initialen}</div>
      <div class="student-naam">${student.naam}</div>
      <div class="student-quote">${student.quote}</div>
    `;
    studentenContainer.appendChild(kaart);
  });
}

function sluitJaarboek() {
  document.getElementById('jaarboek-grid').classList.remove('hidden');
  document.getElementById('jaarboek-detail').classList.add('hidden');
}

// =====================================================
// ADMIN PANEEL - TABS
// =====================================================

function adminTab(tabNaam, knop) {
  // Alle inhoud verbergen
  document.querySelectorAll('.admin-inhoud').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('actief'));

  // Gewenste tab tonen
  const tabMap = {
    'posts': 'admin-posts',
    'fotos': 'admin-fotos-beheer',
    'chat': 'admin-chat-beheer',
    'live': 'admin-live-beheer'
  };

  const tabEl = document.getElementById(tabMap[tabNaam]);
  if (tabEl) tabEl.classList.remove('hidden');
  if (knop) knop.classList.add('actief');

  // Specifieke data laden
  if (tabNaam === 'chat') laadAdminChat();
  if (tabNaam === 'fotos') laadAdminFotos();
}

// Admin: laad posts lijst
function laadAdminPosts() {
  // In echte app: fetch('php/admin_posts.php')
  // Demo: laat zien wat er al is
}

// Admin: laad fotos lijst
function laadAdminFotos() {
  fetch('php/admin_fotos.php')
    .then(r => r.json())
    .then(data => {
      const lijst = document.getElementById('admin-fotos-lijst');
      lijst.innerHTML = '';

      if (!data.fotos || !data.fotos.length) {
        lijst.innerHTML = '<p style="color: var(--grijs)">Nog geen foto\'s geüpload</p>';
        return;
      }

      data.fotos.forEach(foto => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
          <div class="admin-item-info">
            <strong>${foto.naam}</strong>
            <span>Klas: ${foto.klas} — ${foto.datum}</span>
          </div>
          <button onclick="adminVerwijderFoto(${foto.id})" class="btn-gevaar">🗑️</button>
        `;
        lijst.appendChild(item);
      });
    })
    .catch(() => {
      document.getElementById('admin-fotos-lijst').innerHTML = '<p style="color: var(--grijs)">Verbinding met server mislukt</p>';
    });
}

// Admin: laad chat voor moderatie
function laadAdminChat() {
  fetch('php/admin_chat.php')
    .then(r => r.json())
    .then(data => {
      const lijst = document.getElementById('admin-chat-lijst');
      lijst.innerHTML = '';

      if (!data.berichten || !data.berichten.length) {
        lijst.innerHTML = '<p style="color: var(--grijs)">Geen chatberichten</p>';
        return;
      }

      data.berichten.forEach(bericht => {
        const rij = document.createElement('div');
        rij.className = 'chat-moderatie-rij';
        rij.innerHTML = `
          <div>
            <strong style="color: var(--groen)">${bericht.naam}</strong>
            <span style="color: var(--grijs-licht)"> — ${bericht.tekst}</span>
          </div>
          <button onclick="verwijderChatBericht(${bericht.id})" class="btn-admin-klein">🗑️ Verwijder</button>
        `;
        lijst.appendChild(rij);
      });
    })
    .catch(() => {
      document.getElementById('admin-chat-lijst').innerHTML = '<p style="color: var(--grijs)">Verbinding met server mislukt</p>';
    });
}

// Admin: verwijder een foto
function adminVerwijderFoto(id) {
  if (!confirm('Weet je zeker dat je deze foto wil verwijderen?')) return;

  fetch('php/foto_verwijder.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  }).then(() => {
    toonToast('Foto verwijderd ✅', 'success');
    laadAdminFotos();
    laadFotos();
  }).catch(() => {
    toonToast('Verwijderd (demo) ✅', 'info');
  });
}

// =====================================================
// TOAST MELDING SYSTEEM
// =====================================================

// Toon een korte popup melding (rechts onderin)
function toonToast(tekst, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icoon = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icoon[type] || 'ℹ️'}</span> ${tekst}`;

  container.appendChild(toast);

  // Toast na 3 seconden weghalen
  setTimeout(() => {
    toast.style.animation = 'toast-in 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =====================================================
// PAGINA INITIALISATIE
// =====================================================

// Controleer of iemand al ingelogd is (sessie)
function checkSessie() {
  const ingelogd = sessionStorage.getItem('glr_ingelogd');
  const rol = sessionStorage.getItem('glr_rol');

  if (ingelogd === 'true') {
    appStatus.isIngelogd = true;
    appStatus.isAdmin = (rol === 'admin');
    loginSucces();
  }
}

// Zorg dat likes van LocalStorage worden geladen
laadGelaalPosts();

// Sessie check uitvoeren als de pagina laadt
document.addEventListener('DOMContentLoaded', checkSessie);
