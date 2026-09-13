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

      <div style={{ display: 'grid', gap: 8 }}>
        {STAGES.map((stage) => {
          const open = isStageUnlocked(save, category.id, tier, stage);
          const cleared = isStageCleared(save, category.id, tier, stage);
          const record = save.stages[stageKey(category.id, tier, stage)];
          const count = questionsOfStage(category.id, tier, stage).length;
          const title = category.stageTitles[tier][stage - 1];

          let status: string;
          if (!open) {
            status = isTierUnlocked(save, category.id, tier)
              ? '앞 스테이지를 깨면 열립니다'
              : tierUnlockHint(tier);
          } else if (count === 0) status = '문제 준비 중';
          else if (cleared) status = `클리어 · 최고 ${record?.bestCorrect ?? 0}/5`;
          else status = `${count}문제 · 도전 가능`;

          return (
            <button
              key={stage}
              type="button"
              className="thick"
              disabled={!open || count === 0}
              onClick={() => startStage(stage)}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span
                style={{
                  width: 28, height: 28, borderRadius: '50%', flex: '0 0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                  background: cleared ? 'var(--accent)' : open ? 'var(--pick)' : 'var(--border)',
                }}
              >
                {cleared ? '✓' : stage}
              </span>
              <span>
                <span style={{ display: 'block' }}>{title}</span>
                <span className="muted" style={{ fontSize: 11 }}>{status}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
