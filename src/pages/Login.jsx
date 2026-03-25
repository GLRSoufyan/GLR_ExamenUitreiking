import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BgSquares from '../components/BgSquares';
import CapLogo from '../components/CapLogo';

export default function Login() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin() {
    if (!code.trim()) return;
    const ok = login(code);
    if (ok) {
      navigate('/home');
    } else {
      setError('Ongeldige toegangscode. Probeer opnieuw.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      background: 'radial-gradient(ellipse at 50% 0%, #1a3a00 0%, #060e00 60%)',
    }}>
      <BgSquares />

      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        width: '100%', maxWidth: 440,
        padding: '0 24px',
        minHeight: '100%',
        gap: 32,
      }}>
        {/* Logo */}
        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
          <CapLogo size={120} />
        </div>

        {/* Title */}
        <div style={{
          textAlign: 'center',
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(2rem, 10vw, 3.2rem)',
            fontWeight: 900,
            color: 'var(--green)',
            lineHeight: 1.05,
            letterSpacing: 2,
            animation: 'glow 3s ease-in-out infinite',
          }}>
            DIPLOMA<br />UITREIKING
          </h1>
        </div>

        {/* Login card */}
        <div style={{
          background: 'var(--green)',
          borderRadius: 20,
          padding: '28px 24px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'fadeUp 0.5s ease 0.2s both',
          boxShadow: '0 0 40px rgba(127,255,0,0.25)',
        }}>
          <p style={{
            textAlign: 'center',
            color: '#1a3a00',
            fontWeight: 600,
            fontSize: 17,
          }}>
            Voer de toegangscode in:
          </p>

          <div style={{
            animation: shake ? 'shakeX 0.4s ease' : 'none',
          }}>
            <style>{`
              @keyframes shakeX {
                0%,100% { transform: translateX(0); }
                20%      { transform: translateX(-8px); }
                40%      { transform: translateX(8px); }
                60%      { transform: translateX(-6px); }
                80%      { transform: translateX(6px); }
              }
            `}</style>
            <input
              type="password"
              placeholder="···"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              onKeyDown={handleKey}
              style={{
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(0,60,0,0.3)',
                borderRadius: 10,
                color: '#0a1a00',
                fontSize: 20,
                textAlign: 'center',
                letterSpacing: 4,
                fontWeight: 700,
              }}
              autoComplete="off"
            />
          </div>

          {error && (
            <p style={{ color: '#5c0000', fontSize: 14, textAlign: 'center', fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="btn"
            style={{
              background: '#0a1a00',
              color: 'var(--green)',
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 10,
              border: 'none',
              padding: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
            }}
          >
            Inloggen
          </button>
        </div>

        {/* GLR label */}
        <p style={{
          color: 'var(--text-dim)',
          fontSize: 13,
          letterSpacing: 2,
          animation: 'fadeUp 0.5s ease 0.3s both',
        }}>
          GRAFISCH LYCEUM ROTTERDAM
        </p>
      </div>
    </div>
  );
}