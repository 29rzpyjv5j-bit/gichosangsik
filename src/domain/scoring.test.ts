import {
  questionPrize, stagePrizeLines, dailyPrizeLines, reviewPrizeLines, sumLines,
} from './scoring';
import { makeQuestion } from '../test/factories';

test('단계 배수가 적용된다', () => {
  expect(questionPrize('basic', false)).toBe(10_000);
  expect(questionPrize('mid', false)).toBe(15_000);
  expect(questionPrize('advanced', false)).toBe(20_000);
});

test('전에 맞힌 문제는 절반만 준다', () => {
  expect(questionPrize('basic', true)).toBe(5_000);
  expect(questionPrize('mid', true)).toBe(7_500);
  expect(questionPrize('advanced', true)).toBe(10_000);
});

const midQuestions = () =>
  Array.from({ length: 5 }, (_, i) =>
    makeQuestion({ id: `kh-m-0${i + 1}`, tier: 'mid', category: 'korean-history' }),
  );

test('첫 만점 클리어의 상금 내역', () => {
  const lines = stagePrizeLines({
    questions: midQuestions(),
    results: ['correct', 'correct', 'correct', 'correct', 'correct'],
    alreadyCorrect: [false, false, false, false, false],
    firstClear: true,
    perfectFirstTime: true,
    cleared: true,
  });
  expect(lines).toEqual([
    { label: '정답 5개 (중급 1.5배)', amount: 75_000 },
    { label: '첫 클리어 보너스', amount: 20_000 },
    { label: '만점 보너스', amount: 30_000 },
  ]);
  expect(sumLines(lines)).toBe(125_000);
});

test('클리어하지 못하면 보너스가 없다', () => {
  const lines = stagePrizeLines({
    questions: midQuestions(),
    results: ['correct', 'correct', 'wrong', 'wrong', 'passed'],
    alreadyCorrect: [false, false, false, false, false],
    firstClear: false,
    perfectFirstTime: false,
    cleared: false,
  });
  expect(lines).toEqual([{ label: '정답 2개 (중급 1.5배)', amount: 30_000 }]);
});

test('재도전에서 이미 맞힌 문제는 절반, 못 맞혔던 문제는 정가', () => {
  const lines = stagePrizeLines({
    questions: midQuestions(),
    results: ['correct', 'correct', 'correct', 'correct', 'correct'],
    alreadyCorrect: [true, true, true, false, false],
    firstClear: false,
    perfectFirstTime: false,
    cleared: true,
  });
  // 7,500 × 3 + 15,000 × 2 = 52,500
  expect(sumLines(lines)).toBe(52_500);
});

test('두 번째 만점에는 만점 보너스가 붙지 않는다', () => {
  const lines = stagePrizeLines({
    questions: midQuestions(),
    results: ['correct', 'correct', 'correct', 'correct', 'correct'],
    alreadyCorrect: [true, true, true, true, true],
    firstClear: false,
    perfectFirstTime: false,
    cleared: true,
  });
  expect(lines.map((l) => l.label)).toEqual(['정답 5개 (중급 1.5배)']);
});

test('패스한 문제는 상금을 주지 않는다', () => {
  const lines = stagePrizeLines({
    questions: midQuestions(),
    results: ['passed', 'passed', 'passed', 'passed', 'passed'],
    alreadyCorrect: [false, false, false, false, false],
    firstClear: false,
    perfectFirstTime: false,
    cleared: false,
  });
  expect(sumLines(lines)).toBe(0);
});

test('볼게임은 단계가 섞이고 완료 보너스는 자격이 있을 때만 붙는다', () => {
  const questions = [
    makeQuestion({ id: 'a', tier: 'basic' }),
    makeQuestion({ id: 'b', tier: 'mid' }),
    makeQuestion({ id: 'c', tier: 'advanced' }),
    makeQuestion({ id: 'd', tier: 'basic' }),
    makeQuestion({ id: 'e', tier: 'basic' }),
  ];
  const results = ['correct', 'correct', 'correct', 'wrong', 'wrong'] as const;
  const already = [false, false, false, false, false];

  const withBonus = dailyPrizeLines({
    questions, results: [...results], alreadyCorrect: already, bonusEligible: true,
  });
  // 10,000 + 15,000 + 20,000 = 45,000, + 보너스 30,000
  expect(sumLines(withBonus)).toBe(75_000);
  expect(withBonus.at(-1)).toEqual({ label: '볼게임 완료 보너스', amount: 30_000 });

  const withoutBonus = dailyPrizeLines({
    questions, results: [...results], alreadyCorrect: already, bonusEligible: false,
  });
  expect(sumLines(withoutBonus)).toBe(45_000);
  expect(withoutBonus.map((l) => l.label)).not.toContain('볼게임 완료 보너스');
});

test('오답노트 정답은 문제당 5,000원 정액이다', () => {
  expect(sumLines(reviewPrizeLines(3))).toBe(15_000);
  expect(reviewPrizeLines(0)).toEqual([]);
});
