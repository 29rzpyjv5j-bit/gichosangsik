import type { CategoryId, SaveState, StageNo, Tier } from '../types';
import { stageKey, TIERS, TIER_NAMES } from '../types';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories';

export function stagesOf(c: CategoryId, t: Tier): StageNo[] {
  return CATEGORY_BY_ID[c].stageTitles[t].map((_, i) => i + 1);
}

export function totalStages(c: CategoryId): number {
  return TIERS.reduce((n, t) => n + stagesOf(c, t).length, 0);
}

// 섬 지도에서 보이는 1부터의 통산 단계 번호
export function stageNumber(c: CategoryId, t: Tier, s: StageNo): number {
  let n = 0;
  for (const tier of TIERS) {
    if (tier === t) return n + s;
    n += stagesOf(c, tier).length;
  }
  return n + s;
}

export function isStageCleared(
  state: SaveState, c: CategoryId, t: Tier, s: StageNo,
): boolean {
  return state.stages[stageKey(c, t, s)]?.cleared === true;
}

export function isTierUnlocked(state: SaveState, c: CategoryId, t: Tier): boolean {
  if (t === 'basic') return true;
  const prev: Tier = t === 'mid' ? 'basic' : 'mid';
  return stagesOf(c, prev).every((s) => isStageCleared(state, c, prev, s));
}

export function isStageUnlocked(
  state: SaveState, c: CategoryId, t: Tier, s: StageNo,
): boolean {
  if (!isTierUnlocked(state, c, t)) return false;
  if (s === 1) return true;
  return isStageCleared(state, c, t, s - 1);
}

export function clearedCount(state: SaveState, c: CategoryId): number {
  let n = 0;
  for (const t of TIERS) {
    for (const s of stagesOf(c, t)) if (isStageCleared(state, c, t, s)) n += 1;
  }
  return n;
}

export function tierUnlockHint(c: CategoryId, t: Tier): string {
  if (t === 'basic') return '처음부터 열려 있습니다';
  const prev: Tier = t === 'mid' ? 'basic' : 'mid';
  return `${TIER_NAMES[prev]} ${stagesOf(c, prev).length}스테이지를 모두 깨면 열립니다`;
}

export function nextStage(
  state: SaveState, c: CategoryId,
): { tier: Tier; stage: StageNo } | null {
  for (const t of TIERS) {
    for (const s of stagesOf(c, t)) {
      if (isStageUnlocked(state, c, t, s) && !isStageCleared(state, c, t, s)) {
        return { tier: t, stage: s };
      }
    }
  }
  return null;
}

export function nextStageAnywhere(
  state: SaveState, preferred: CategoryId | null,
): { category: CategoryId; tier: Tier; stage: StageNo } | null {
  const order: CategoryId[] = preferred
    ? [preferred, ...CATEGORIES.map((c) => c.id).filter((id) => id !== preferred)]
    : CATEGORIES.map((c) => c.id);
  for (const category of order) {
    const found = nextStage(state, category);
    if (found) return { category, ...found };
  }
  return null;
}
