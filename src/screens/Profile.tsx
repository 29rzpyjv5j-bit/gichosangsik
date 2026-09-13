import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { getLevel } from '../domain/level';
import { clearedCount } from '../domain/unlock';
import { CATEGORIES } from '../data/categories';
import { AVATARS, THEMES } from '../data/shop';
import { formatMoney } from '../components/Money';

export default function Profile() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const save = state.save;
  const level = getLevel(save.totalPrize);

  const plays = Object.values(save.stages).reduce((acc, s) => acc + s.plays, 0);

  function accuracy(prefix: string): string {
    const stats = Object.entries(save.questionStats).filter(([id]) => id.startsWith(prefix));
    const correct = stats.reduce((acc, [, s]) => acc + s.correct, 0);
    const wrong = stats.reduce((acc, [, s]) => acc + s.wrong, 0);
    if (correct + wrong === 0) return '기록 없음';
    return `${Math.round((correct / (correct + wrong)) * 100)}%`;
  }

  const prefixOf: Record<string, string> = {
    'korean-history': 'kh-', 'world-history': 'wh-', science: 'sc-',
    math: 'ma-', music: 'mu-', art: 'ar-', 'current-affairs': 'ca-',
  };

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

      <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>
        Lv.{level.level} {level.title}
      </h2>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 4px' }}>
        누적 <b>{formatMoney(save.totalPrize)}</b> · 지갑 <b>{formatMoney(save.wallet)}</b>
      </p>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 18px' }}>
        총 {plays}판 · 만점 {save.perfectCount}회 · 볼게임 {save.dailyGame.completed}회
      </p>

      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>카테고리별 정답률</h3>
      <div style={{ display: 'grid', gap: 6, marginBottom: 22 }}>
        {CATEGORIES.map((c) => (
          <div
            key={c.id}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
          >
            <span>{c.emoji} {c.name}</span>
            <span className="muted">
              {accuracy(prefixOf[c.id])} · 클리어 {clearedCount(save, c.id)}/9
            </span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>테마</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {THEMES.map((theme) => {
          const owned = save.owned.themes.includes(theme.id);
          const active = save.settings.theme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              className="thick"
              disabled={!owned}
              onClick={() => dispatch({ type: 'SET_THEME', theme: theme.id })}
              style={{
                width: 'auto', padding: '8px 12px', fontSize: 12,
                borderColor: active ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {theme.name}{active ? ' ✓' : ''}
            </button>
          );
        })}
      </div>

      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>아바타</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 26 }}>
        {AVATARS.map((avatar) => {
          const owned = save.owned.avatars.includes(avatar.id);
          const active = save.settings.avatar === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              className="thick"
              disabled={!owned}
              onClick={() => dispatch({ type: 'SET_AVATAR', avatar: avatar.id })}
              style={{
                width: 'auto', padding: '8px 12px', fontSize: 20,
                borderColor: active ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {avatar.emoji}
            </button>
          );
        })}
      </div>

      {confirming ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--no)', margin: 0 }}>
            상금·레벨·뱃지·오답노트가 모두 사라지고 되돌릴 수 없어요.
          </p>
          <button
            type="button"
            className="thick"
            onClick={() => {
              dispatch({ type: 'RESET_ALL' });
              setConfirming(false);
            }}
          >
            정말 지울게요
          </button>
          <button type="button" className="thick" onClick={() => setConfirming(false)}>
            그만두기
          </button>
        </div>
      ) : (
        <button type="button" className="thick" onClick={() => setConfirming(true)}>
          전체 초기화
        </button>
      )}
    </div>
  );
}
