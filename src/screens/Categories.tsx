import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { CATEGORIES } from '../data/categories';
import { clearedCount } from '../domain/unlock';
import { ProgressBar } from '../components/ProgressBar';
import { Landmark } from '../components/Icons';

export default function Categories() {
  const { state } = useGame();
  const navigate = useNavigate();

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
      <h2 style={{ fontSize: 18, margin: '0 0 14px' }}>카테고리</h2>

      <div style={{ display: 'grid', gap: 8 }}>
        {CATEGORIES.map((c) => {
          const done = clearedCount(state.save, c.id);
          return (
            <button
              key={c.id}
              type="button"
              className="thick"
              onClick={() => navigate(`/category/${c.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Landmark category={c.id} size={34} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', marginBottom: 4 }}>{c.name}</span>
                <ProgressBar value={done} max={9} />
              </span>
              <span className="muted" style={{ fontSize: 11 }}>{done}/9</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
