import { useNavigate } from 'react-router-dom';
import CapLogo from './CapLogo';
import { useAuth } from '../context/AuthContext';

export default function Header({ showBack = false, rightLabel, rightAction, title }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      position: 'relative',
      zIndex: 10,
      minHeight: 72,
    }}>
      {/* Left: back button or spacer */}
      <div style={{ width: 56 }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(0,40,0,0.7)',
              border: '1.5px solid var(--green-border)',
              borderRadius: 10,
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--green)',
              fontSize: 22,
            }}
            aria-label="Terug"
          >
            ←
          </button>
        )}
      </div>

      {/* Center: logo or title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CapLogo size={52} />
        {title && (
          <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1 }}>
            {title}
          </span>
        )}
      </div>

      {/* Right: action button */}
      <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        {rightLabel && (
          <>
            <button
              onClick={rightAction}
              style={{
                background: 'rgba(0,40,0,0.7)',
                border: '1.5px solid var(--green-border)',
                borderRadius: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                color: 'var(--green)',
                fontFamily: 'var(--font-main)',
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: 'nowrap',
              }}
            >
              {rightLabel}
            </button>
            {isAdmin && (
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Admins</span>
            )}
          </>
        )}
      </div>
    </header>
  );
}