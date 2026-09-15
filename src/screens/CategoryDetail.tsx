import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { CATEGORY_BY_ID } from '../data/categories';
import { questionsOfStage } from '../data/questions';
import {
  clearedCount, isStageCleared, isStageUnlocked, isTierUnlocked, nextStage, stageNumber, stagesOf,
  tierUnlockHint, totalStages,
} from '../domain/unlock';
import { growthStageOf } from '../domain/growth';
import { getLevel } from '../domain/level';
import { TIERS, TIER_NAMES, stageKey } from '../types';
import type { CategoryId, Tier } from '../types';
import { formatMoney } from '../components/Money';
import { ProgressBar } from '../components/ProgressBar';
import { Penguin } from '../components/Penguin';
import { Icon, Landmark } from '../components/Icons';

const ROW = 66; // 노드 사이 세로 간격
const TIER_GAP = 70; // 단계(입문/중급/상급) 사이에 상자와 이름표가 들어갈 틈
const TOP_PAD = 80;
const BOTTOM_PAD = 60;
const ZONE_META: Record<Tier, { icon: 'sprout' | 'tree' | 'mount'; label: string; bg: string }> = {
  basic: { icon: 'sprout', label: '입문 들판', bg: 'linear-gradient(180deg,#dcf3d0,#c7ebb6)' },
  mid: { icon: 'tree', label: '중급 숲', bg: 'linear-gradient(180deg,#fff1d6,#ffe2b8)' },
  advanced: { icon: 'mount', label: '상급 설산', bg: 'linear-gradient(180deg,#f3eefc,#e7ddfb)' },
};

// 스테이지 수에 맞춰 아래(1단계)에서 위로 구불구불 올라가는 배치를 만든다
function layout(counts: number[]) {
  const nodes: [number, number][] = [];
  const zones: { top: number; bottom: number }[] = [];
  const chests: number[] = [];
  const total = counts.reduce((a, b) => a + b, 0);
  const height = TOP_PAD + BOTTOM_PAD + (total - 1) * ROW + TIER_GAP * (counts.length - 1);
  let y = height - BOTTOM_PAD;
  let bottom = height;
  let i = 0;
  counts.forEach((count, t) => {
    for (let k = 0; k < count; k++) {
      if (k > 0) y -= ROW;
      nodes.push([50 + 25 * Math.sin(i * 1.05), y]);
      i += 1;
    }
    const last = t === counts.length - 1;
    const top = last ? 0 : y - (TIER_GAP + ROW) / 2;
    zones.push({ top, bottom });
    if (!last) {
      chests.push(top);
      bottom = top;
      y -= TIER_GAP + ROW;
    }
  });
  return { nodes, zones, chests, height };
}

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
  const total = category ? totalStages(category.id) : 0;
  const currentIndex = current && category ? stageNumber(category.id, current.tier, current.stage) - 1 : total - 1;
  const [selected, setSelected] = useState(currentIndex);
  const currentRef = useRef<HTMLButtonElement>(null);

  // 들어오면 현재 내 위치(펭귄이 있는 단계)가 화면 가운데 오도록
  useEffect(() => {
    currentRef.current?.scrollIntoView?.({ block: 'center' });
  }, [categoryId]);

  if (!category) {
    return (
      <div className="screen">
        <p>없는 섬이에요.</p>
        <button type="button" className="thick" onClick={() => navigate('/')}>지도로 가기</button>
      </div>
    );
  }

  const nodes = TIERS.flatMap((tier) => stagesOf(category.id, tier).map((stage) => {
    const open = isStageUnlocked(save, category.id, tier, stage);
    const cleared = isStageCleared(save, category.id, tier, stage);
    const record = save.stages[stageKey(category.id, tier, stage)];
    const count = questionsOfStage(category.id, tier, stage).length;
    let status: string;
    if (!open) {
      status = isTierUnlocked(save, category.id, tier)
        ? '앞 스테이지를 깨면 열립니다'
        : tierUnlockHint(category.id, tier);
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

  const pick = nodes[selected] ?? nodes[0];
  const map = layout(TIERS.map((t) => stagesOf(category.id, t).length));
  const pathD = pathThrough(map.nodes);
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
            <ProgressBar value={clearedCount(save, category.id)} max={total} />
          </div>
          <span className="muted" style={{ fontSize: 11, fontWeight: 900 }}>
            {clearedCount(save, category.id)}/{total}
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
          height: map.height,
          borderRadius: 30,
          overflow: 'hidden',
        }}
      >
        {TIERS.map((tier, t) => (
          <div
            key={tier}
            aria-hidden
            style={{ position: 'absolute', left: 0, right: 0, top: map.zones[t].top, height: map.zones[t].bottom - map.zones[t].top, background: ZONE_META[tier].bg }}
          />
        ))}
        <svg
          aria-hidden
          viewBox={`0 0 330 ${map.height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <path d="M0 150L60 90L110 130L170 60L240 120L290 80L330 140V224H0Z" fill="#fff" opacity=".8" />
          <path d={pathD} fill="none" stroke="#fffaf0" strokeWidth="30" strokeLinecap="round" />
          <path d={pathD} fill="none" stroke="#ecc98f" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
        </svg>
        {map.nodes.map(([x, y], i) => i % 4 === 2 && (
          <Icon
            key={`deco-${i}`}
            name={nodes[i].tier === 'basic' ? 'sprout' : nodes[i].tier === 'mid' ? 'tree' : 'mount'}
            size={34}
            style={{ position: 'absolute', top: y - 4, [x > 50 ? 'left' : 'right']: 10, opacity: 0.7 }}
          />
        ))}

        {TIERS.map((tier, t) => (
          <span
            key={tier}
            className="pill puffy"
            style={{
              position: 'absolute', top: map.zones[t].bottom - 40,
              [t % 2 === 0 ? 'right' : 'left']: 10, padding: '3px 10px 3px 5px', fontSize: 11,
            }}
          >
            <Icon name={ZONE_META[tier].icon} size={18} />
            {ZONE_META[tier].label}
          </span>
        ))}

        {map.chests.map((y, i) => {
          const tier = TIERS[i];
          const done = stagesOf(category.id, tier).every((s) => isStageCleared(save, category.id, tier, s));
          return (
            <span key={tier} style={{ position: 'absolute', left: '50%', top: y - 22, marginLeft: -22 }}>
              <Icon name={done ? 'party' : 'gift'} size={44} />
            </span>
          );
        })}
        <span style={{ position: 'absolute', left: '62%', top: 14 }}>
          <Icon name="flag" size={40} />
        </span>

        {nodes.map((node, i) => {
          const [x, y] = map.nodes[i];
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
              ref={i === currentIndex ? currentRef : undefined}
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
              left: `calc(${map.nodes[currentIndex][0]}% ${map.nodes[currentIndex][0] > 50 ? '-' : '+'} 34px)`,
              top: map.nodes[currentIndex][1] - 10, marginLeft: -26,
            }}
          >
            <Penguin stage={growth.index} size={52} outfit={save.settings.outfit} />
          </div>
        )}
      </div>

      <div
        className="puffy"
        style={{
          position: 'sticky', bottom: 'calc(108px + env(safe-area-inset-bottom, 0px))', marginTop: 12, padding: '12px 14px', borderRadius: 24,
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
          {pick.open ? stageNumber(category.id, pick.tier, pick.stage) : <Icon name="lock" size={26} />}
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
