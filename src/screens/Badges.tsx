import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { BADGES } from '../data/badges';
import { Medal } from '../components/Medal';

export default function Badges() {
  const { state } = useGame();
  const navigate = useNavigate();
  const save = state.save;
  const earnedAt = new Map(save.badges.map((b) => [b.id, b.earnedAt]));

  return (
    <div className="screen">
      <button
        type="button"
        className="muted"
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: 12 }}
        onClick={() => navigate('/')}
      >
        ‹ 홈
      </button>
      <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>뱃지</h2>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 16px' }}>
        {save.badges.length} / {BADGES.length} 획득
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 8px' }}>
        {BADGES.map((badge) => {
          const day = earnedAt.get(badge.id);
          const earned = Boolean(day);
          return (
            <div key={badge.id} style={{ textAlign: 'center' }}>
              <Medal id={badge.id} group={badge.group} earned={earned} size={56} />
              <div
                style={{
                  fontSize: 11, fontWeight: 800, marginTop: 6, lineHeight: 1.35,
                  color: earned ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {badge.name}
              </div>
              <div className="muted" style={{ fontSize: 9.5, marginTop: 2 }}>
                {earned ? day : badge.progress(save)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
