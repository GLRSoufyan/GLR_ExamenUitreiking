import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import CapLogo from '../components/CapLogo';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  {
    path: '/live',
    label: 'Livestream',
    sub: 'Bekijk de uitreiking live',
    icon: '▶',
    color: '#7fff00',
  },
  {
    path: '/fotos',
    label: "Foto's",
    sub: "Bekijk en download foto's",
    icon: '🖼',
    color: 'var(--green)',
  },
  {
    path: '/jaarboek',
    label: 'Jaarboek',
    sub: 'Alle geslaagde studenten',
    icon: '📖',
    color: 'var(--green)',
  },
];

const adminItems = [
  {
    path: '/upload',
    label: "Foto's Uploaden",
    sub: 'Admin: foto per klas uploaden',
    icon: '⬆',
    color: 'var(--gold)',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  return (
    <Layout>
      <Header
        rightLabel="Uitloggen"
        rightAction={() => { logout(); navigate('/'); }}
      />

      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Welcome */}
        <div style={{
          textAlign: 'center',
          padding: '16px 0 8px',
          animation: 'fadeUp 0.4s ease both',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 22,
            color: 'var(--green)',
            letterSpacing: 1,
          }}>
            WELKOM BIJ
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>
            Diploma Uitreiking 2026 — GLR
          </p>
        </div>

        {/* Menu cards */}
        {[...menuItems, ...(isAdmin ? adminItems : [])].map((item, i) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '22px 20px',
              cursor: 'pointer',
              background: 'var(--bg-card)',
              borderColor: item.color === 'var(--gold)' ? 'rgba(200,150,12,0.5)' : 'var(--green-border)',
              width: '100%',
              textAlign: 'left',
              animation: `fadeUp 0.4s ease ${0.05 * i + 0.1}s both`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{
              fontSize: 32,
              width: 52, height: 52,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,60,0,0.5)',
              borderRadius: 12,
              border: '1px solid var(--green-border)',
              flexShrink: 0,
            }}>
              {item.icon}
            </span>
            <div>
              <p style={{
                fontFamily: 'var(--font-main)',
                fontWeight: 600,
                fontSize: 18,
                color: item.color,
              }}>
                {item.label}
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                {item.sub}
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 20 }}>›</span>
          </button>
        ))}

        {/* Info block */}
        <div style={{
          background: 'rgba(0,30,0,0.6)',
          borderRadius: 12,
          border: '1px solid rgba(127,255,0,0.2)',
          padding: '16px 20px',
          animation: 'fadeUp 0.4s ease 0.4s both',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
            📍 <strong style={{ color: 'var(--green)' }}>Grafisch Lyceum Rotterdam</strong><br />
            Heer Bokelweg 255, 3032 AA Rotterdam<br />
            Diploma-uitreiking 2026
          </p>
        </div>
      </div>
    </Layout>
  );
}