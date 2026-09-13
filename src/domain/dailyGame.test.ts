import {
  todayString, isDailyBonusEligible, unlockedQuestions, weightOf,
  pickDailyQuestions, mulberry32,
} from './dailyGame';
import { makeSave, makeQuestion } from '../test/factories';
import { stageKey } from '../types';
import type { Question, StageNo, Tier } from '../types';

function bank(): Question[] {
  const out: Question[] = [];
  const tiers: [Tier, string][] = [['basic', 'b'], ['mid', 'm']];
  for (const [tier, short] of tiers) {
    for (let i = 1; i <= 15; i++) {
      out.push(makeQuestion({
        id: `sc-${short}-${String(i).padStart(2, '0')}`,
        tier,
        stage: Math.ceil(i / 5) as StageNo,
      }));
    }
  }
  return out;
}

test('오늘 날짜를 YYYY-MM-DD로 만든다', () => {
  expect(todayString(new Date(2026, 8, 13))).toBe('2026-09-13');
  expect(todayString(new Date(2026, 11, 1))).toBe('2026-12-01');
});

test('보너스는 하루에 한 번만 자격이 있다', () => {
  const fresh = makeSave();
  expect(isDailyBonusEligible(fresh, '2026-09-13')).toBe(true);
  const used = makeSave({ dailyGame: { lastBonusDate: '2026-09-13', completed: 1 } });
  expect(isDailyBonusEligible(used, '2026-09-13')).toBe(false);
  expect(isDailyBonusEligible(used, '2026-09-14')).toBe(true);
});

test('해금된 스테이지의 문제만 뽑는다', () => {
  const fresh = makeSave();
  const pool = unlockedQuestions(fresh, bank());
  expect(pool).toHaveLength(5);
  expect(pool.every((q) => q.tier === 'basic' && q.stage === 1)).toBe(true);

  const opened = makeSave({
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 1 } },
  });
  expect(unlockedQuestions(opened, bank())).toHaveLength(10);
});

test('가중치는 오답 3, 미풀이 2, 이미 맞힌 문제 1이다', () => {
  const q = makeQuestion({ id: 'sc-b-01' });
  expect(weightOf(makeSave(), q)).toBe(2);
  expect(weightOf(makeSave({ wrongNotes: ['sc-b-01'] }), q)).toBe(3);
  expect(weightOf(
    makeSave({ questionStats: { 'sc-b-01': { correct: 1, wrong: 0 } } }), q,
  )).toBe(1);
});

test('5문제를 중복 없이 뽑는다', () => {
  const opened = makeSave({
    stages: {
      [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 1 },
      [stageKey('science', 'basic', 2)]: { cleared: true, bestCorrect: 5, plays: 1 },
    },
  });
  const picked = pickDailyQuestions(opened, bank(), mulberry32(7));
  expect(picked).toHaveLength(5);
  expect(new Set(picked.map((q) => q.id)).size).toBe(5);
});

test('풀이 문제가 5개보다 적으면 있는 만큼만 준다', () => {
  const picked = pickDailyQuestions(makeSave(), bank().slice(0, 3), mulberry32(1));
  expect(picked.length).toBeLessThanOrEqual(3);
});

test('오답노트 문제가 더 자주 뽑힌다', () => {
  const opened = makeSave({
    stages: {
      [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 1 },
      [stageKey('science', 'basic', 2)]: { cleared: true, bestCorrect: 5, plays: 1 },
    },
    wrongNotes: ['sc-b-01'],
  });
  const rng = mulberry32(42);
  let hitWrong = 0;
  let hitPlain = 0;
  for (let i = 0; i < 400; i++) {
    const ids = pickDailyQuestions(opened, bank(), rng).map((q) => q.id);
    if (ids.includes('sc-b-01')) hitWrong += 1;
    if (ids.includes('sc-b-02')) hitPlain += 1;
  }
  expect(hitWrong).toBeGreaterThan(hitPlain);
});

test('같은 시드는 같은 결과를 준다', () => {
  const s = makeSave();
  const a = pickDailyQuestions(s, bank(), mulberry32(99)).map((q) => q.id);
  const b = pickDailyQuestions(s, bank(), mulberry32(99)).map((q) => q.id);
  expect(a).toEqual(b);
});
