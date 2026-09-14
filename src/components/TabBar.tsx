import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { to: '/', emoji: '🏠', label: '홈' },
  { to: '/wrong-notes', emoji: '📕', label: '복습' },
  { to: '/badges', emoji: '🏅', label: '도감' },
  { to: '/shop', emoji: '🛍️', label: '상점' },
  { to: '/profile', emoji: '🐧', label: '내 펭귄' },
];

export function TabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="주요 메뉴"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: 480,
          margin: '0 10px 10px',
          display: 'grid',
          gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          borderRadius: 24,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          padding: '6px 4px',
        }}
      >
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          return (
            <button
              key={tab.to}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(tab.to)}
              style={{
                border: 'none',
                borderRadius: 16,
                padding: '6px 0',
                background: active ? 'var(--ok-bg)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              <span aria-hidden style={{ display: 'block', fontSize: 22, lineHeight: 1.1 }}>
                {tab.emoji}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
