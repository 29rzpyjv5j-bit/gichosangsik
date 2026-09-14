import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { Icon, type IconName } from './Icons';

const TABS: { to: string; icon: IconName; label: string }[] = [
  { to: '/', icon: 'map', label: '지도' },
  { to: '/wrong-notes', icon: 'book', label: '복습' },
  { to: '/badges', icon: 'medal', label: '도감' },
  { to: '/shop', icon: 'shop', label: '상점' },
  { to: '/profile', icon: 'penguin', label: '내 펭귄' },
];

export function TabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useGame();
  const notes = state.save.wrongNotes.length;

  return (
    <nav
      aria-label="주요 메뉴"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 5,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}
    >
      <div
        className="puffy"
        style={{
          pointerEvents: 'auto', width: '100%', maxWidth: 460, margin: '0 10px 10px',
          display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
          padding: '7px 4px', borderRadius: 28,
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
                position: 'relative',
                border: 'none',
                borderRadius: 18,
                padding: '4px 0 3px',
                background: active ? 'linear-gradient(180deg,#ffe2d6,#ffd2c0)' : 'transparent',
                boxShadow: active ? 'inset 0 2px 0 #fff' : 'none',
                color: active ? 'var(--accent-shadow)' : 'var(--muted)',
                fontSize: 10,
                fontWeight: 900,
              }}
            >
              <Icon name={tab.icon} size={30} style={{ display: 'block', margin: '0 auto' }} />
              {tab.label}
              {tab.to === '/wrong-notes' && notes > 0 && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute', top: 0, right: 10, background: '#ff6b6b', color: '#fff',
                    fontSize: 9, borderRadius: 99, padding: '0 5px',
                  }}
                >
                  {notes}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
