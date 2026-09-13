import { LEVELS } from '../data/levels';

export function getLevel(totalPrize: number): {
  level: number;
  title: string;
  nextThreshold: number | null;
  remaining: number | null;
} {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalPrize >= LEVELS[i].threshold) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  return {
    level: current.level,
    title: current.title,
    nextThreshold: next ? next.threshold : null,
    remaining: next ? next.threshold - totalPrize : null,
  };
}
