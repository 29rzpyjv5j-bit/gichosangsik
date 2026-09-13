import type { Question, SaveState } from '../types';
import { isStageUnlocked } from './unlock';

export function todayString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isDailyBonusEligible(state: SaveState, today: string): boolean {
  return state.dailyGame.lastBonusDate !== today;
}

export function unlockedQuestions(state: SaveState, all: Question[]): Question[] {
  return all.filter((q) => isStageUnlocked(state, q.category, q.tier, q.stage));
}

export function weightOf(state: SaveState, q: Question): 1 | 2 | 3 {
  if (state.wrongNotes.includes(q.id)) return 3;
  const stat = state.questionStats[q.id];
  if (!stat || (stat.correct === 0 && stat.wrong === 0)) return 2;
  if (stat.correct > 0) return 1;
  return 3;
}

export function pickDailyQuestions(
  state: SaveState, all: Question[], rng: () => number, count = 5,
): Question[] {
  const pool = unlockedQuestions(state, all).map((q) => ({ q, w: weightOf(state, q) }));
  const picked: Question[] = [];

  while (picked.length < count && pool.length > 0) {
    const total = pool.reduce((acc, item) => acc + item.w, 0);
    let target = rng() * total;
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      target -= pool[i].w;
      if (target <= 0) {
        index = i;
        break;
      }
    }
    picked.push(pool[index].q);
    pool.splice(index, 1);
  }

  return picked;
}

// 시드를 받는 작은 난수 생성기. 테스트에서 같은 시드로 같은 결과를 얻는다.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
