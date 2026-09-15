import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { getLevel } from '../domain/level';
import { clearedCount } from '../domain/unlock';
import { GROWTH_STAGES, growthStageOf, nextGrowthStage } from '../domain/growth';
import { CATEGORIES } from '../data/categories';
import { formatMoney } from '../components/Money';
import { Penguin } from '../components/Penguin';
import { Room } from '../components/Room';
import { BackupCard } from '../components/BackupCard';
import { Icon, Landmark } from '../components/Icons';

const PREFIX: Record<string, string> = {
  'korean-history': 'kh-', 'world-history': 'wh-', science: 'sc-',
  math: 'ma-', music: 'mu-', art: 'ar-', 'current-affairs': 'ca-',
};

export default function Profile() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const save = state.save;
  const level = getLevel(save.totalPrize);
  const growth = growthStageOf(level.level);
  const next = nextGrowthStage(level.level);
  const plays = Object.values(save.stages).reduce((acc, s) => acc + s.plays, 0);

  function accuracy(prefix: string): string {
    const stats = Object.entries(save.questionStats).filter(([id]) => id.startsWith(prefix));
    const correct = stats.reduce((acc, [, s]) => acc + s.correct, 0);
    const wrong = stats.reduce((acc, [, s]) => acc + s.wrong, 0);
    if (correct + wrong === 0) return '기록 없음';
    return `${Math.round((correct / (correct + wrong)) * 100)}%`;
  }

  return (
    <div className="screen">
      <div style={{ margin: '4px 4px 12px' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>내 펭귄</h1>
        <p className="muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
          Lv.{level.level} {level.title} · {growth.name}
          {next && ` · Lv.${next.fromLevel}에 ${next.name}`}
        </p>
      </div>

      <Room room={save.settings.room} wallpaper={save.settings.theme} stage={growth.index} outfit={save.settings.outfit} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0' }}>
        <button type="button" className="puffy pill" style={{ justifyContent: 'center', padding: 10 }} onClick={() => navigate('/shop?tab=furniture')}>
          <Icon name="shop" size={22} />방 꾸미기
        </button>
        <button type="button" className="puffy pill" style={{ justifyContent: 'center', padding: 10 }} onClick={() => navigate('/shop?tab=outfit')}>
          <Icon name="penguin" size={22} />펭귄 옷장
        </button>
      </div>

      <div className="puffy" style={{ padding: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 12, textAlign: 'center' }}>
          <div><div className="muted" style={{ fontSize: 10 }}>누적</div><b>{formatMoney(save.totalPrize)}</b></div>
          <div><div className="muted" style={{ fontSize: 10 }}>지갑</div><b>{formatMoney(save.wallet)}</b></div>
        </div>
        <p className="muted" style={{ fontSize: 11, textAlign: 'center', margin: '8px 0 0' }}>
          총 {plays}판 · 만점 {save.perfectCount}회 · 섞어 풀기 {save.dailyGame.completed}회
        </p>
      </div>

      <div className="puffy" style={{ padding: 12, marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>펭귄 성장 단계</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
          {GROWTH_STAGES.map((g) => {
            const reached = level.level >= g.fromLevel;
            const isNow = growth.index === g.index;
            return (
              <div key={g.index} style={{ textAlign: 'center', opacity: reached ? 1 : 0.4 }}>
                <div
                  style={{
                    borderRadius: 16, padding: '4px 0',
                    background: isNow ? 'linear-gradient(180deg,#ffe2d6,#ffd2c0)' : 'transparent',
                    filter: reached ? 'none' : 'grayscale(1) brightness(1.1)',
                  }}
                >
                  <Penguin stage={g.index} size={50} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, marginTop: 2 }}>{reached ? g.name : '???'}</div>
                <div className="muted" style={{ fontSize: 9 }}>Lv.{g.fromLevel}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="puffy" style={{ padding: 12, marginBottom: 18 }}>
        <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>섬별 정답률</h3>
        <div style={{ display: 'grid', gap: 6 }}>
          {CATEGORIES.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <Landmark category={c.id} size={22} />
              <span style={{ flex: 1 }}>{c.name}</span>
              <span className="muted">{accuracy(PREFIX[c.id])} · 클리어 {clearedCount(save, c.id)}/9</span>
            </div>
          ))}
        </div>
      </div>

      <BackupCard />

      {confirming ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--no)', margin: 0 }}>
            상금·레벨·뱃지·오답노트·가구가 모두 사라지고 되돌릴 수 없어요.
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
