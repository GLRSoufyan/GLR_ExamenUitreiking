import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { fotos as initialFotos } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13M8 13l4 4 4-4" />
      <path d="M4 19h16" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#7fff00' : 'none'} stroke="#7fff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function Photos() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [fotos, setFotos] = useState(initialFotos);

  function toggleLike(id) {
    setFotos(f => f.map(foto => foto.id === id ? { ...foto, geliked: !foto.geliked } : foto));
  }

  function handleDownload(foto) {
    const a = document.createElement('a');
    a.href = foto.url;
    a.download = `${foto.titel}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }

  return (
    <Layout>
      <Header
        showBack={false}
        rightLabel={isAdmin ? 'Uploaden' : undefined}
        rightAction={() => navigate('/upload')}
      />

      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {fotos.map((foto, i) => (
          <div
            key={foto.id}
            className="card"
            style={{
              position: 'relative',
              animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
            }}
          >
            {/* Download button */}
            <button
              onClick={() => handleDownload(foto)}
              style={{
                position: 'absolute',
                top: 12, right: 12,
                background: 'rgba(0,20,0,0.8)',
                border: '1.5px solid var(--green-border)',
                borderRadius: 8,
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--green)',
                zIndex: 5,
              }}
              aria-label="Downloaden"
            >
              <DownloadIcon />
            </button>

            {/* Photo */}
            <img
              src={foto.url}
              alt={foto.titel}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />

            {/* Title bar */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              background: 'rgba(0,20,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--green)' }}>
                {foto.titel}
              </span>
              <button
                onClick={() => toggleLike(foto.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                aria-label={foto.geliked ? 'Unlike' : 'Like'}
              >
                <HeartIcon filled={foto.geliked} />
              </button>
            </div>

            {/* Klas tag */}
            <div style={{
              position: 'absolute',
              top: 12, left: 12,
              background: 'rgba(0,20,0,0.75)',
              border: '1px solid var(--green-border)',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              color: 'var(--text-dim)',
              fontWeight: 500,
            }}>
              {foto.klas}
            </div>
          </div>
        ))}

        {/* Map card */}
        <div className="card" style={{ overflow: 'hidden', animation: `fadeUp 0.4s ease ${fotos.length * 0.07}s both` }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--green-border)' }}>
            <p style={{ fontWeight: 600, fontSize: 15 }}>Grafisch Lyceum Rotterdam</p>
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Heer Bokelweg 255, 3032 AA Rotterdam</p>
          </div>
          <iframe
            title="GLR locatie"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2461.0!2d4.461!3d51.922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c434a1bc9a5d53%3A0x7bce9bb3e3fe0b54!2sGrafisch%20Lyceum%20Rotterdam!5e0!3m2!1snl!2snl!4v1"
            style={{ width: '100%', height: 200, border: 'none', display: 'block' }}
            loading="lazy"
          />
        </div>
      </div>
    </Layout>
  );
}