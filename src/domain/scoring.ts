import type { Question, Tier } from '../types';
import { TIER_NAMES } from '../types';

export const BASE_PRIZE = 10_000;
export const TIER_MULTIPLIER: Record<Tier, number> = { basic: 1, mid: 1.5, advanced: 2 };
export const FIRST_CLEAR_BONUS = 20_000;
export const PERFECT_BONUS = 30_000;
export const DAILY_BONUS = 30_000;
export const WRONG_NOTE_PRIZE = 5_000;

export type QuestionResult = 'correct' | 'wrong' | 'passed';
export type PrizeLine = { label: string; amount: number };

export function questionPrize(tier: Tier, alreadyCorrect: boolean): number {
  return BASE_PRIZE * TIER_MULTIPLIER[tier] * (alreadyCorrect ? 0.5 : 1);
}

function correctPrizeTotal(
  questions: Question[],
  results: QuestionResult[],
  alreadyCorrect: boolean[],
): { total: number; count: number } {
  let total = 0;
  let count = 0;
  results.forEach((r, i) => {
    if (r !== 'correct') return;
    count += 1;
    total += questionPrize(questions[i].tier, alreadyCorrect[i]);
  });
  return { total, count };
}

export function stagePrizeLines(args: {
  questions: Question[];
  results: QuestionResult[];
  alreadyCorrect: boolean[];
  firstClear: boolean;
  perfectFirstTime: boolean;
  cleared: boolean;
}): PrizeLine[] {
  const { total, count } = correctPrizeTotal(args.questions, args.results, args.alreadyCorrect);
  const tier = args.questions[0].tier;
  const multiplier = TIER_MULTIPLIER[tier];
  const lines: PrizeLine[] = [];
  if (count > 0) {
    lines.push({
      label: `정답 ${count}개 (${TIER_NAMES[tier]} ${multiplier}배)`,
      amount: total,
    });
  }
  if (args.cleared && args.firstClear) {
    lines.push({ label: '첫 클리어 보너스', amount: FIRST_CLEAR_BONUS });
  }
  if (args.cleared && args.perfectFirstTime && count === args.questions.length) {
    lines.push({ label: '만점 보너스', amount: PERFECT_BONUS });
  }
  return lines;
}

export function dailyPrizeLines(args: {
  questions: Question[];
  results: QuestionResult[];
  alreadyCorrect: boolean[];
  bonusEligible: boolean;
}): PrizeLine[] {
  const { total, count } = correctPrizeTotal(args.questions, args.results, args.alreadyCorrect);
  const lines: PrizeLine[] = [];
  if (count > 0) lines.push({ label: `정답 ${count}개`, amount: total });
  if (args.bonusEligible) lines.push({ label: '볼게임 완료 보너스', amount: DAILY_BONUS });
  return lines;
}

export function reviewPrizeLines(correctCount: number): PrizeLine[] {
  if (correctCount <= 0) return [];
  return [{ label: `오답 정답 ${correctCount}개`, amount: correctCount * WRONG_NOTE_PRIZE }];
}

export function sumLines(lines: PrizeLine[]): number {
  return lines.reduce((acc, l) => acc + l.amount, 0);
}
