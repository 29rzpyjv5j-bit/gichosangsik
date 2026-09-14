import {
  startSession, currentQuestion, canUseItem, applyItem, answerCurrent,
  advance, isFinished, correctCount, isCleared, ITEM_PRICE,
} from './quizSession';
import { makeQuestion } from '../test/factories';
import { mulberry32 } from './dailyGame';
import type { Question } from '../types';

const five = (): Question[] =>
  Array.from({ length: 5 }, (_, i) =>
    makeQuestion({
      id: `sc-b-0${i + 1}`,
      choices: ['가', '나', '다', '라'],
      answerIndex: 1,
    }),
  );

const stageMode = { kind: 'stage', category: 'science', tier: 'basic', stage: 1 } as const;

function fresh() {
  return startSession(stageMode, five(), [false, false, false, false, false]);
}

test('시작하면 첫 문제부터 아무 결과 없이 출발한다', () => {
  const s = fresh();
  expect(s.index).toBe(0);
  expect(s.revealed).toBe(false);
  expect(s.results).toEqual([]);
  expect(currentQuestion(s).id).toBe('sc-b-01');
});

test('정답을 고르면 correct로 기록되고 해설이 열린다', () => {
  const s = answerCurrent(fresh(), 1);
  expect(s.results[0]).toBe('correct');
  expect(s.revealed).toBe(true);
  expect(s.pickedIndex).toBe(1);
});

test('오답을 고르면 wrong으로 기록된다', () => {
  const s = answerCurrent(fresh(), 0);
  expect(s.results[0]).toBe('wrong');
  expect(s.revealed).toBe(true);
});

test('해설이 열린 상태에서 다시 답해도 결과가 바뀌지 않는다', () => {
  let s = answerCurrent(fresh(), 0);
  s = answerCurrent(s, 1);
  expect(s.results[0]).toBe('wrong');
});

test('다음으로 넘기면 해설이 닫히고 다음 문제로 간다', () => {
  let s = answerCurrent(fresh(), 1);
  s = advance(s);
  expect(s.index).toBe(1);
  expect(s.revealed).toBe(false);
  expect(s.pickedIndex).toBeNull();
});

test('5문제를 다 풀면 끝난다', () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) {
    s = answerCurrent(s, 1);
    s = advance(s);
  }
  expect(isFinished(s)).toBe(true);
  expect(correctCount(s)).toBe(5);
});

test('3문제 이상 맞히면 클리어, 2문제면 아니다', () => {
  let s = fresh();
  [1, 1, 1, 0, 0].forEach((pick) => {
    s = advance(answerCurrent(s, pick));
  });
  expect(correctCount(s)).toBe(3);
  expect(isCleared(s)).toBe(true);

  let t = fresh();
  [1, 1, 0, 0, 0].forEach((pick) => {
    t = advance(answerCurrent(t, pick));
  });
  expect(isCleared(t)).toBe(false);
});

test('섞어 풀기과 오답노트 모드에는 클리어 개념이 없다', () => {
  let s = startSession({ kind: 'daily' }, five(), [false, false, false, false, false]);
  [1, 1, 1, 1, 1].forEach((pick) => {
    s = advance(answerCurrent(s, pick));
  });
  expect(isCleared(s)).toBe(false);
});

test('반반 찬스는 오답 보기 2개를 지운다', () => {
  const s = applyItem(fresh(), 'half', mulberry32(3));
  expect(s.removedChoices[0]).toHaveLength(2);
  expect(s.removedChoices[0]).not.toContain(1);
  expect(s.spent).toBe(ITEM_PRICE.half);
  expect(s.usedItems[0]).toEqual(['half']);
});

test('힌트는 힌트 카드를 열고 비용을 쓴다', () => {
  const s = applyItem(fresh(), 'hint', mulberry32(3));
  expect(s.hintOpen[0]).toBe(true);
  expect(s.spent).toBe(ITEM_PRICE.hint);
});

test('패스는 그 문제를 passed로 기록하고 해설을 연다', () => {
  const s = applyItem(fresh(), 'pass', mulberry32(3));
  expect(s.results[0]).toBe('passed');
  expect(s.revealed).toBe(true);
  expect(s.spent).toBe(ITEM_PRICE.pass);
});

test('같은 아이템을 한 문제에서 두 번 쓸 수 없다', () => {
  const s = applyItem(fresh(), 'hint', mulberry32(3));
  expect(canUseItem(s, 'hint', 999_999)).toBe(false);
  const t = applyItem(s, 'hint', mulberry32(3));
  expect(t.spent).toBe(ITEM_PRICE.hint);
});

test('잔액이 부족하면 쓸 수 없다', () => {
  const s = fresh();
  expect(canUseItem(s, 'half', ITEM_PRICE.half - 1)).toBe(false);
  expect(canUseItem(s, 'half', ITEM_PRICE.half)).toBe(true);
});

test('OX 문제에서는 반반 찬스를 쓸 수 없다', () => {
  const ox = [makeQuestion({ id: 'sc-b-01', type: 'ox', choices: ['O', 'X'], answerIndex: 0 })];
  const s = startSession({ kind: 'daily' }, ox, [false]);
  expect(canUseItem(s, 'half', 999_999)).toBe(false);
});

test('해설이 열린 뒤에는 아이템을 쓸 수 없다', () => {
  const s = answerCurrent(fresh(), 1);
  expect(canUseItem(s, 'hint', 999_999)).toBe(false);
});

test('OX 문제에서 applyItem으로 반반 찬스를 써도 아무 변화가 없다', () => {
  const ox = [makeQuestion({ id: 'sc-b-01', type: 'ox', choices: ['O', 'X'], answerIndex: 0 })];
  const s = startSession({ kind: 'daily' }, ox, [false]);
  const t = applyItem(s, 'half', mulberry32(3));
  expect(t.removedChoices[0]).toBeUndefined();
  expect(t.spent).toBe(0);
  expect(t).toEqual(s);
});

test('이미 답을 고른 뒤 applyItem으로 패스해도 결과와 비용이 바뀌지 않는다', () => {
  const answered = answerCurrent(fresh(), 1);
  const s = applyItem(answered, 'pass', mulberry32(3));
  expect(s.results[0]).toBe('correct');
  expect(s.revealed).toBe(true);
  expect(s.spent).toBe(0);
  expect(s).toEqual(answered);
});

test('끝난 세션에 applyItem을 써도 예외 없이 그대로 반환된다', () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) {
    s = advance(answerCurrent(s, 1));
  }
  expect(isFinished(s)).toBe(true);
  expect(() => applyItem(s, 'half', mulberry32(3))).not.toThrow();
  const t = applyItem(s, 'half', mulberry32(3));
  expect(t).toEqual(s);
});

test('같은 아이템을 applyItem으로 두 번 써도 두 번째는 아무 변화가 없다', () => {
  const s = applyItem(fresh(), 'hint', mulberry32(3));
  const t = applyItem(s, 'hint', mulberry32(3));
  expect(t).toEqual(s);
  expect(t.spent).toBe(ITEM_PRICE.hint);
});
