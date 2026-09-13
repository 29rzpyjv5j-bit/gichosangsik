import type { CategoryId, SaveState, StageNo, Tier } from '../types';
import { stageKey, TIERS, TIER_NAMES } from '../types';
import { CATEGORIES } from '../data/categories';

const STAGES: StageNo[] = [1, 2, 3];

export function isStageCleared(
  state: SaveState, c: CategoryId, t: Tier, s: StageNo,
): boolean {
  return state.stages[stageKey(c, t, s)]?.cleared === true;
}

export function isTierUnlocked(state: SaveState, c: CategoryId, t: Tier): boolean {
  if (t === 'basic') return true;
  const prev: Tier = t === 'mid' ? 'basic' : 'mid';
  return STAGES.every((s) => isStageCleared(state, c, prev, s));
}

export function isStageUnlocked(
  state: SaveState, c: CategoryId, t: Tier, s: StageNo,
): boolean {
  if (!isTierUnlocked(state, c, t)) return false;
  if (s === 1) return true;
  return isStageCleared(state, c, t, (s - 1) as StageNo);
}

export function clearedCount(state: SaveState, c: CategoryId): number {
  let n = 0;
  for (const t of TIERS) {
    for (const s of STAGES) if (isStageCleared(state, c, t, s)) n += 1;
  }
  return n;
}

export function tierUnlockHint(t: Tier): string {
  if (t === 'basic') return '처음부터 열려 있습니다';
  const prev: Tier = t === 'mid' ? 'basic' : 'mid';
  return `${TIER_NAMES[prev]} 3스테이지를 모두 깨면 열립니다`;
}

export function nextStage(
  state: SaveState, c: CategoryId,
): { tier: Tier; stage: StageNo } | null {
  for (const t of TIERS) {
    for (const s of STAGES) {
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
