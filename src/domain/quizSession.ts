import type { CategoryId, Question, StageNo, Tier } from '../types';
import type { QuestionResult } from './scoring';

export type ItemId = 'half' | 'hint' | 'pass';

export const ITEM_PRICE: Record<ItemId, number> = {
  half: 20_000,
  hint: 30_000,
  pass: 15_000,
};

export const ITEM_LABEL: Record<ItemId, string> = {
  half: '반반',
  hint: '힌트',
  pass: '패스',
};

export const ITEM_EMOJI: Record<ItemId, string> = {
  half: '✂️',
  hint: '💡',
  pass: '⏭️',
};

export const CLEAR_THRESHOLD = 3;

export type SessionMode =
  | { kind: 'stage'; category: CategoryId; tier: Tier; stage: StageNo }
  | { kind: 'daily' }
  | { kind: 'review' };

export type QuizSession = {
  mode: SessionMode;
  questions: Question[];
  alreadyCorrect: boolean[];
  index: number;
  results: QuestionResult[];
  pickedIndex: number | null;
  revealed: boolean;
  usedItems: Record<number, ItemId[]>;
  removedChoices: Record<number, number[]>;
  hintOpen: Record<number, boolean>;
  spent: number;
};

export function startSession(
  mode: SessionMode, questions: Question[], alreadyCorrect: boolean[],
): QuizSession {
  return {
    mode,
    questions,
    alreadyCorrect,
    index: 0,
    results: [],
    pickedIndex: null,
    revealed: false,
    usedItems: {},
    removedChoices: {},
    hintOpen: {},
    spent: 0,
  };
}

export function currentQuestion(s: QuizSession): Question {
  return s.questions[s.index];
}

export function isFinished(s: QuizSession): boolean {
  return s.index >= s.questions.length;
}

export function correctCount(s: QuizSession): number {
  return s.results.filter((r) => r === 'correct').length;
}

export function isCleared(s: QuizSession): boolean {
  if (s.mode.kind !== 'stage') return false;
  return correctCount(s) >= CLEAR_THRESHOLD;
}

// 세션 상태만으로 판단할 수 있는 금지 규칙(지갑 잔액 제외).
// canUseItem과 applyItem이 서로 다른 기준으로 어긋나지 않도록 여기 한 곳에서만 정의한다.
function isItemBlockedByState(s: QuizSession, item: ItemId): boolean {
  if (isFinished(s) || s.revealed) return true;
  if ((s.usedItems[s.index] ?? []).includes(item)) return true;
  if (item === 'half' && currentQuestion(s).type === 'ox') return true;
  return false;
}

export function canUseItem(s: QuizSession, item: ItemId, wallet: number): boolean {
  if (isItemBlockedByState(s, item)) return false;
  if (wallet < ITEM_PRICE[item]) return false;
  return true;
}

export function applyItem(s: QuizSession, item: ItemId, rng: () => number): QuizSession {
  if (isItemBlockedByState(s, item)) return s;

  const used = { ...s.usedItems, [s.index]: [...(s.usedItems[s.index] ?? []), item] };
  const base = { ...s, usedItems: used, spent: s.spent + ITEM_PRICE[item] };

  if (item === 'hint') {
    return { ...base, hintOpen: { ...s.hintOpen, [s.index]: true } };
  }

  if (item === 'pass') {
    const results = [...s.results];
    results[s.index] = 'passed';
    return { ...base, results, revealed: true, pickedIndex: null };
  }

  // half: 오답 보기 중 2개를 무작위로 고른다
  const q = currentQuestion(s);
  const wrongIndexes = q.choices
    .map((_, i) => i)
    .filter((i) => i !== q.answerIndex);
  const chosen: number[] = [];
  const pool = [...wrongIndexes];
  while (chosen.length < 2 && pool.length > 0) {
    const at = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
    chosen.push(pool[at]);
    pool.splice(at, 1);
  }
  return { ...base, removedChoices: { ...s.removedChoices, [s.index]: chosen } };
}

export function answerCurrent(s: QuizSession, choiceIndex: number): QuizSession {
  if (s.revealed || isFinished(s)) return s;
  const q = currentQuestion(s);
  const results = [...s.results];
  results[s.index] = choiceIndex === q.answerIndex ? 'correct' : 'wrong';
  return { ...s, results, pickedIndex: choiceIndex, revealed: true };
}

export function advance(s: QuizSession): QuizSession {
  return { ...s, index: s.index + 1, revealed: false, pickedIndex: null };
}
