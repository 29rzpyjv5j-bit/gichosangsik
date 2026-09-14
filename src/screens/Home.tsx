import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { getLevel } from '../domain/level';
import { clearedCount, nextStageAnywhere } from '../domain/unlock';
import { growthStageOf } from '../domain/growth';
import { ALL_QUESTIONS } from '../data/questions';
import { CATEGORY_BY_ID } from '../data/categories';
import { TIERS } from '../types';
import type { CategoryId } from '../types';
import { formatMoney } from '../components/Money';
import { Penguin } from '../components/Penguin';
import { Icon, IslandShape, ISLAND_COLOR, Landmark } from '../components/Icons';

// 순서가 아니라 지도처럼 흩어 놓은 섬 배치 (지도 영역 기준)
const ISLANDS: { id: CategoryId; left: string; top: number; width: number }[] = [
  { id: 'korean-history', left: '1%', top: 438, width: 150 },
  { id: 'science', left: '50%', top: 322, width: 160 },
  { id: 'world-history', left: '3%', top: 238, width: 128 },
  { id: 'math', left: '52%', top: 160, width: 116 },
  { id: 'music', left: '2%', top: 104, width: 108 },
  { id: 'art', left: '36%', top: 20, width: 100 },
  { id: 'current-affairs', left: '70%', top: 92, width: 92 },
];

export default function Home() {
  const { state } = useGame();
  const navigate = useNavigate();
  const save = state.save;
  const level = getLevel(save.totalPrize);
  const growth = growthStageOf(level.level);
  const resume = nextStageAnywhere(save, save.lastPlayed?.category ?? null);
  const resumeIsland = ISLANDS.find((i) => i.id === (resume?.category ?? 'korean-history'))!;

  const bubbleText = resume
    ? resume.category === save.lastPlayed?.category
      ? `${CATEGORY_BY_ID[resume.category].name} 섬 ${TIERS.indexOf(resume.tier) * 3 + resume.stage}단계부터!`
      : `${CATEGORY_BY_ID[resume.category].name} 섬부터 시작해요`
    : '모든 섬을 정복했어요!';

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <button type="button" className="pill puffy" onClick={() => navigate('/profile')}>
          <span
            style={{
              background: 'linear-gradient(180deg,#ffb89d,#ff8a65)', color: '#fff',
              borderRadius: 99, padding: '2px 9px', fontSize: 12,
            }}
          >
            Lv.{level.level}
          </span>
          {growth.name}
        </button>
        <span className="pill puffy">
          <Icon name="coin" size={22} />
          <span>{formatMoney(save.wallet)}</span>
        </span>
      </div>

      <div style={{ margin: '0 4px 12px' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>어느 섬으로 떠날까요?</h1>
        <p className="muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
          섬마다 입문부터 상급까지 9단계 여정이 있어요 · {level.title}
        </p>
      </div>

      <div
        style={{
          position: 'relative',
          height: 560,
          borderRadius: 30,
          overflow: 'hidden',
          background: '#9fd6ee',
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,.28), transparent 70%), ' +
            'radial-gradient(ellipse 14px 6px at 20px 16px, transparent 60%, rgba(214,240,250,.9) 62%, transparent 72%)',
          backgroundSize: '100% 100%, 46px 30px',
          boxShadow: 'inset 0 4px 14px rgba(255,255,255,.6)',
        }}
      >
        <Icon name="compass" size={40} style={{ position: 'absolute', left: 12, top: 12 }} />
        <div className="drift" style={{ position: 'absolute', right: 14, top: 18, opacity: 0.9 }}>
          <Icon name="cloud" size={64} />
        </div>
        <div className="drift" style={{ position: 'absolute', left: '40%', top: 280, opacity: 0.8, animationDelay: '-3s' }}>
          <Icon name="cloud" size={48} />
        </div>
        <Icon name="boat" size={42} style={{ position: 'absolute', left: '40%', top: 410 }} />

        {ISLANDS.map((island) => {
          const category = CATEGORY_BY_ID[island.id];
          const hasQuestions = ALL_QUESTIONS.some((q) => q.category === island.id);
          const done = clearedCount(save, island.id);
          const isLast = save.lastPlayed?.category === island.id;
          const landmark = Math.round(island.width * 0.42);
          return (
            <button
              key={island.id}
              type="button"
              onClick={() => navigate(`/category/${island.id}`)}
              style={{
                position: 'absolute',
                left: island.left,
                top: island.top,
                width: island.width,
                padding: 0,
                border: 'none',
                background: 'none',
                opacity: hasQuestions ? 1 : 0.62,
                filter: isLast ? 'drop-shadow(0 0 6px #fff) drop-shadow(0 0 2px #fff)' : 'none',
              }}
            >
              <IslandShape color={ISLAND_COLOR[island.id]} width={island.width} />
              <span style={{ position: 'absolute', left: '50%', top: -landmark * 0.22, marginLeft: -landmark / 2 }}>
                <Landmark category={island.id} size={landmark} />
              </span>
              <span
                className="pill puffy"
                style={{
                  position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%)',
                  padding: '2px 9px', fontSize: 11, whiteSpace: 'nowrap',
                }}
              >
                {category.name}
                {hasQuestions ? (
                  done > 0 && <b style={{ color: '#e8a020' }}>★{done}</b>
                ) : (
                  <span className="muted" style={{ fontSize: 10 }}>준비 중</span>
                )}
              </span>
            </button>
          );
        })}

        <div
          className="bob"
          style={{
            position: 'absolute',
            left: `calc(${resumeIsland.left} + ${resumeIsland.width * 0.62}px)`,
            top: resumeIsland.top - 14,
            pointerEvents: 'none',
          }}
        >
          <Penguin stage={growth.index} size={50} outfit={save.settings.outfit} />
        </div>
        <button
          type="button"
          className="puffy"
          onClick={() => resume && navigate(`/category/${resume.category}`)}
          style={{
            position: 'absolute',
            left: `min(calc(${resumeIsland.left} + 4px), calc(100% - 196px))`,
            top: Math.max(8, resumeIsland.top - 58),
            border: 'none',
            borderRadius: 14,
            padding: '6px 8px 6px 11px',
            fontSize: 11,
            fontWeight: 900,
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}
        >
          {bubbleText}
          {resume && (
            <span
              style={{
                background: 'linear-gradient(180deg,#ffb89d,#ff8a65)', color: '#fff',
                borderRadius: 99, padding: '1px 8px', fontSize: 10,
              }}
            >
              출발
            </span>
          )}
        </button>
      </div>

      {state.storageWarning !== 'none' && (
        <p style={{ fontSize: 11, color: 'var(--no)', marginTop: 14 }}>
          {state.storageWarning === 'unavailable'
            ? '이 브라우저에서는 기록을 저장할 수 없어요. 창을 닫으면 진행이 사라집니다.'
            : '저장된 기록을 읽지 못해 새로 시작했어요.'}
        </p>
      )}
    </div>
  );
}
