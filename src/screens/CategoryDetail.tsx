import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { CATEGORY_BY_ID } from '../data/categories';
import { questionsOfStage } from '../data/questions';
import {
  clearedCount, isStageCleared, isStageUnlocked, isTierUnlocked, nextStage, tierUnlockHint,
} from '../domain/unlock';
import { growthStageOf } from '../domain/growth';
import { getLevel } from '../domain/level';
import { TIERS, TIER_NAMES, stageKey } from '../types';
import type { CategoryId, StageNo, Tier } from '../types';
import { formatMoney } from '../components/Money';
import { ProgressBar } from '../components/ProgressBar';
import { Penguin } from '../components/Penguin';
import { Icon, Landmark } from '../components/Icons';

const STAGES: StageNo[] = [1, 2, 3];
const MAP_HEIGHT = 700;

// 아래(1단계)에서 위(9단계)로 올라가는 노드 위치: x는 %, y는 px
const NODE_POS: [number, number][] = [
  [24, 620], [70, 566], [30, 494],
  [68, 380], [26, 322], [70, 262],
  [30, 150], [66, 100], [42, 34],
];
const CHEST_POS: [number, number][] = [[50, 436], [48, 208]];
const ZONES: { tier: Tier; icon: 'sprout' | 'tree' | 'mount'; label: string; top: number; side: 'left' | 'right' }[] = [
  { tier: 'basic', icon: 'sprout', label: '입문 들판', top: 660, side: 'right' },
  { tier: 'mid', icon: 'tree', label: '중급 숲', top: 430, side: 'right' },
  { tier: 'advanced', icon: 'mount', label: '상급 설산', top: 206, side: 'left' },
];

// 노드들을 부드럽게 잇는 길 (Catmull-Rom → 베지어)
function pathThrough(points: [number, number][]): string {
  const p = points.map(([x, y]) => [x * 3.3, y] as [number, number]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const category = CATEGORY_BY_ID[categoryId as CategoryId];
  const save = state.save;

  const current = category ? nextStage(save, category.id) : null;
  const currentIndex = current ? TIERS.indexOf(current.tier) * 3 + current.stage - 1 : 8;
  const [selected, setSelected] = useState(currentIndex);

  if (!category) {
    return (
      <div className="screen">
        <p>없는 섬이에요.</p>
        <button type="button" className="thick" onClick={() => navigate('/')}>지도로 가기</button>
      </div>
    );
  }

  const nodes = TIERS.flatMap((tier) => STAGES.map((stage) => {
    const open = isStageUnlocked(save, category.id, tier, stage);
    const cleared = isStageCleared(save, category.id, tier, stage);
    const record = save.stages[stageKey(category.id, tier, stage)];
    const count = questionsOfStage(category.id, tier, stage).length;
    let status: string;
    if (!open) {
      status = isTierUnlocked(save, category.id, tier)
        ? '앞 스테이지를 깨면 열립니다'
        : tierUnlockHint(tier);
    } else if (count === 0) status = '문제 준비 중';
    else if (cleared) status = `클리어 · 최고 ${record?.bestCorrect ?? 0}/5`;
    else status = `${count}문제 · 도전 가능`;
    const best = record?.bestCorrect ?? 0;
    return {
      tier, stage, open, cleared, count, status,
      title: category.stageTitles[tier][stage - 1],
      stars: !cleared ? 0 : best >= 5 ? 3 : best >= 4 ? 2 : 1,
      playable: open && count > 0,
    };
  }));

  const pick = nodes[selected];
  const growth = growthStageOf(getLevel(save.totalPrize).level);

  function start() {
    if (!pick.playable) return;
    const questions = questionsOfStage(category.id, pick.tier, pick.stage);
    dispatch({ type: 'START_STAGE', category: category.id, tier: pick.tier, stage: pick.stage, questions });
    navigate('/quiz');
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          aria-label="지도로"
          className="puffy"
          onClick={() => navigate('/')}
          style={{ width: 40, height: 40, borderRadius: 14, border: 'none', fontWeight: 900, fontSize: 18 }}
        >
          ‹
        </button>
        <div className="puffy" style={{ flex: 1, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Landmark category={category.id} size={30} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, margin: 0 }}>{category.name} 섬</h2>
            <ProgressBar value={clearedCount(save, category.id)} max={9} />
          </div>
          <span className="muted" style={{ fontSize: 11, fontWeight: 900 }}>
            {clearedCount(save, category.id)}/9
          </span>
        </div>
        <span className="pill puffy" style={{ padding: '4px 10px 4px 5px' }}>
          <Icon name="coin" size={20} />
          {formatMoney(save.wallet)}
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: MAP_HEIGHT,
          borderRadius: 30,
          overflow: 'hidden',
          background: 'linear-gradient(180deg,#f3eefc 0%,#e7ddfb 32%,#fff1d6 32%,#ffe2b8 64%,#dcf3d0 64%,#c7ebb6 100%)',
        }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 330 ${MAP_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <path d="M0 150L60 90L110 130L170 60L240 120L290 80L330 140V224H0Z" fill="#fff" opacity=".8" />
          <path d={pathThrough(NODE_POS)} fill="none" stroke="#fffaf0" strokeWidth="30" strokeLinecap="round" />
          <path d={pathThrough(NODE_POS)} fill="none" stroke="#ecc98f" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
        </svg>
        <Icon name="tree" size={42} style={{ position: 'absolute', left: 8, top: 300, opacity: 0.7 }} />
        <Icon name="tree" size={36} style={{ position: 'absolute', right: 12, top: 470, opacity: 0.7 }} />
        <Icon name="sprout" size={32} style={{ position: 'absolute', left: 14, top: 540 }} />

        {ZONES.map((z) => (
          <span
            key={z.tier}
            className="pill puffy"
            style={{ position: 'absolute', top: z.top, [z.side]: 10, padding: '3px 10px 3px 5px', fontSize: 11 }}
          >
            <Icon name={z.icon} size={18} />
            {z.label}
          </span>
        ))}

        {CHEST_POS.map(([x, y], i) => {
          const tier = TIERS[i];
          const done = STAGES.every((s) => isStageCleared(save, category.id, tier, s));
          return (
            <span key={tier} style={{ position: 'absolute', left: `${x}%`, top: y, marginLeft: -22 }}>
              <Icon name={done ? 'party' : 'gift'} size={44} />
            </span>
          );
        })}
        <span style={{ position: 'absolute', left: '62%', top: 20 }}>
          <Icon name="flag" size={40} />
        </span>

        {nodes.map((node, i) => {
          const [x, y] = NODE_POS[i];
          const isCurrent = current !== null && i === currentIndex;
          const size = isCurrent ? 60 : 52;
          const bg = node.cleared
            ? 'radial-gradient(circle at 32% 28%,#fff1a8,#ffc94d 60%,#f0a830)'
            : isCurrent
              ? 'radial-gradient(circle at 32% 28%,#ffd0bf,#ff8a65 60%,#e8684a)'
              : 'radial-gradient(circle at 32% 28%,#fff,#e6def5 60%,#cdc0e6)';
          return (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}단계 ${node.title}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={`blob${isCurrent ? ' bob' : ''}`}
              style={{
                position: 'absolute', left: `${x}%`, top: y, width: size, height: size,
                marginLeft: -size / 2, marginTop: -size / 2 + 26, borderRadius: '50%', border: 'none',
                background: bg,
                color: node.cleared ? '#8a5a00' : isCurrent ? '#fff' : '#8e80aa',
                fontWeight: 900, fontSize: isCurrent ? 20 : 17,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                outline: selected === i ? '4px solid rgba(255,255,255,.95)' : 'none',
                opacity: node.count === 0 && !node.cleared ? 0.7 : 1,
              }}
            >
              {i + 1}
              {node.cleared && (
                <span style={{ fontSize: 8, letterSpacing: 1, lineHeight: 1 }}>
                  {'★'.repeat(node.stars)}{'☆'.repeat(3 - node.stars)}
                </span>
              )}
            </button>
          );
        })}

        {current && (
          <div
            className="bob"
            style={{
              position: 'absolute', pointerEvents: 'none',
              left: `calc(${NODE_POS[currentIndex][0]}% ${NODE_POS[currentIndex][0] > 50 ? '-' : '+'} 34px)`,
              top: NODE_POS[currentIndex][1] - 10, marginLeft: -26,
            }}
          >
            <Penguin stage={growth.index} size={52} outfit={save.settings.outfit} />
          </div>
        )}
      </div>

      <div
        className="puffy"
        style={{
          position: 'sticky', bottom: 96, marginTop: 12, padding: '12px 14px', borderRadius: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span
          className="blob"
          style={{
            width: 44, height: 44, borderRadius: '50%', flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 17, color: '#fff',
            background: pick.cleared
              ? 'radial-gradient(circle at 32% 28%,#fff1a8,#ffc94d 60%,#f0a830)'
              : pick.playable
                ? 'radial-gradient(circle at 32% 28%,#ffd0bf,#ff8a65 60%,#e8684a)'
                : 'radial-gradient(circle at 32% 28%,#fff,#e6def5 60%,#cdc0e6)',
          }}
        >
          {pick.open ? selected + 1 : <Icon name="lock" size={26} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="muted" style={{ fontSize: 10, fontWeight: 900 }}>
            {TIER_NAMES[pick.tier]} {pick.stage}
          </div>
          <div style={{ fontSize: 15, fontWeight: 900 }}>{pick.title}</div>
          <div className="muted" style={{ fontSize: 11 }}>{pick.status}</div>
        </div>
        <button
          type="button"
          className="thick-accent"
          disabled={!pick.playable}
          onClick={start}
          style={{ width: 'auto', padding: '10px 18px', fontSize: 14 }}
        >
          {pick.cleared ? '다시 도전' : '도전'}
        </button>
      </div>
    </div>
  );
}
