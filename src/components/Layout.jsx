import BgSquares from './BgSquares';
import BottomNav from './BottomNav';

export default function Layout({ children, scrollable = true }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <BgSquares />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: scrollable ? 'auto' : 'hidden',
          overflowX: 'hidden',
          paddingBottom: 'var(--nav-height)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}