import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  {
    path: '/live',
    label: 'Live',
    icon: (active) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill={active ? '#7fff00' : 'rgba(127,255,0,0.4)'}>
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
  },
  {
    path: '/home',
    label: 'Home',
    icon: (active) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? '#7fff00' : 'rgba(127,255,0,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    path: '/jaarboek',
    label: 'Jaarboek',
    icon: (active) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? '#7fff00' : 'rgba(127,255,0,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      background: 'rgba(4, 12, 0, 0.95)',
      borderTop: '1px solid var(--green-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '8px 20px',
              opacity: active ? 1 : 0.6,
              transition: 'opacity 0.2s',
            }}
            aria-label={tab.label}
          >
            {tab.icon(active)}
          </button>
        );
      })}
    </nav>
  );
}