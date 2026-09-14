import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { CATEGORY_BY_ID } from '../data/categories';
import { questionsOfStage } from '../data/questions';
import {
  clearedCount, isStageCleared, isStageUnlocked, isTierUnlocked, tierUnlockHint,
} from '../domain/unlock';
import { TIERS, TIER_NAMES, stageKey } from '../types';
import type { CategoryId, StageNo, Tier } from '../types';

const STAGES: StageNo[] = [1, 2, 3];

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier>('basic');

  const category = CATEGORY_BY_ID[categoryId as CategoryId];
  if (!category) {
    return (
      <div className="screen">
        <p>없는 카테고리예요.</p>
        <button type="button" className="thick" onClick={() => navigate('/categories')}>
          카테고리로 가기
        </button>
      </div>
    );
  }

  const save = state.save;

  function startStage(stage: StageNo) {
    const questions = questionsOfStage(category.id, tier, stage);
    if (questions.length === 0) return;
    dispatch({ type: 'START_STAGE', category: category.id, tier, stage, questions });
    navigate('/quiz');
  }

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
        {category.emoji} {category.name}
      </h2>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 14px' }}>
        클리어 {clearedCount(save, category.id)}/9
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TIERS.map((t) => {
          const open = isTierUnlocked(save, category.id, t);
          const active = t === tier;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: 99,
                padding: '8px 0',
                fontWeight: 800,
                fontSize: 12,
                background: active ? 'var(--accent)' : 'var(--border)',
                color: active ? '#fff' : 'var(--muted)',
                opacity: open ? 1 : 0.6,
              }}
            >
              {TIER_NAMES[t]}
            </button>
          );
        })}
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 26,
          padding: '18px 12px 10px',
          background: 'linear-gradient(180deg, #e8f7df 0%, #d3eec3 100%)',
        }}
      >
        {/* 스테이지를 잇는 길 */}
        <svg
          aria-hidden
          viewBox="0 0 300 330"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: '30px 0 60px', width: '100%', height: 'calc(100% - 90px)' }}
        >
          <path
            d="M80 20 C 240 60, 240 120, 150 165 S 60 270, 220 310"
            fill="none"
            stroke="#fffbe8"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            d="M80 20 C 240 60, 240 120, 150 165 S 60 270, 220 310"
            fill="none"
            stroke="#e9dcb4"
            strokeWidth="3"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
        </svg>

        {STAGES.map((stage, i) => {
          const open = isStageUnlocked(save, category.id, tier, stage);
          const cleared = isStageCleared(save, category.id, tier, stage);
          const record = save.stages[stageKey(category.id, tier, stage)];
          const count = questionsOfStage(category.id, tier, stage).length;
          const title = category.stageTitles[tier][stage - 1];
          const current = open && !cleared && count > 0;

          let status: string;
          if (!open) {
            status = isTierUnlocked(save, category.id, tier)
              ? '앞 스테이지를 깨면 열립니다'
              : tierUnlockHint(tier);
          } else if (count === 0) status = '문제 준비 중';
          else if (cleared) status = `클리어 · 최고 ${record?.bestCorrect ?? 0}/5`;
          else status = `${count}문제 · 도전 가능`;

          const best = record?.bestCorrect ?? 0;
          const stars = !cleared ? 0 : best >= 5 ? 3 : best >= 4 ? 2 : 1;
          const offset = ['0%', '18%', '6%'][i];

          return (
            <button
              key={stage}
              type="button"
              disabled={!open || count === 0}
              onClick={() => startStage(stage)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: `calc(100% - ${offset})`,
                marginLeft: offset,
                marginBottom: 22,
                background: 'none',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                color: 'var(--text)',
                cursor: open && count > 0 ? 'pointer' : 'default',
              }}
            >
              <span
                className={current ? 'bob' : undefined}
                style={{
                  width: 72, height: 72, borderRadius: '50%', flex: '0 0 auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 900,
                  background: cleared
                    ? 'radial-gradient(circle at 35% 30%, #ffe27a, #ffc21a)'
                    : current
                      ? 'radial-gradient(circle at 35% 30%, #9be27a, #58cc02)'
                      : 'radial-gradient(circle at 35% 30%, #f1f1f1, #cfd3d6)',
                  boxShadow: cleared
                    ? '0 5px 0 #d9a100'
                    : current
                      ? '0 5px 0 #46a302'
                      : '0 5px 0 #b3b8bc',
                  color: cleared ? '#8a5a00' : current ? '#fff' : '#8e959b',
                }}
              >
                {cleared ? '★' : open && count > 0 ? stage : '🔒'}
                {cleared && (
                  <span style={{ fontSize: 9, letterSpacing: 1, marginTop: -2 }}>
                    {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                  </span>
                )}
              </span>
              <span
                style={{
                  flex: 1,
                  background: '#fff',
                  borderRadius: 14,
                  padding: '8px 12px',
                  boxShadow: '0 3px 0 rgba(0,0,0,0.06)',
                  opacity: open && count > 0 ? 1 : 0.8,
                }}
              >
                {current && (
                  <span
                    style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 900, color: '#fff',
                      background: '#ff8c42', borderRadius: 99, padding: '1px 8px', marginBottom: 3,
                    }}
                  >
                    도전하기!
                  </span>
                )}
                <span style={{ display: 'block', fontWeight: 900, fontSize: 15 }}>{title}</span>
                <span className="muted" style={{ fontSize: 11 }}>{status}</span>
              </span>
            </button>
          );
        })}

        {/* 단계 보상 상자 */}
        <div style={{ textAlign: 'center', paddingBottom: 6 }}>
          <span aria-hidden style={{ fontSize: 40 }}>
            {STAGES.every((st) => isStageCleared(save, category.id, tier, st)) ? '🎉' : '🎁'}
          </span>
          <div className="muted" style={{ fontSize: 11, fontWeight: 800 }}>
            {TIER_NAMES[tier]} 3스테이지를 모두 깨면 다음 단계가 열려요
          </div>
        </div>
      </div>
    </div>
  );
}
