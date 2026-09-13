import {
  isStageCleared, isTierUnlocked, isStageUnlocked, clearedCount,
  tierUnlockHint, nextStage, nextStageAnywhere,
} from './unlock';
import { makeSave } from '../test/factories';
import { stageKey } from '../types';
import type { CategoryId, StageNo, Tier } from '../types';

function withCleared(entries: [CategoryId, Tier, StageNo][]) {
  const stages: Record<string, { cleared: boolean; bestCorrect: number; plays: number }> = {};
  for (const [c, t, s] of entries) {
    stages[stageKey(c, t, s)] = { cleared: true, bestCorrect: 5, plays: 1 };
  }
  return makeSave({ stages });
}

test('입문 1스테이지는 처음부터 열려 있다', () => {
  const s = makeSave();
  expect(isStageUnlocked(s, 'science', 'basic', 1)).toBe(true);
  expect(isStageUnlocked(s, 'current-affairs', 'basic', 1)).toBe(true);
});

test('이전 스테이지를 깨야 다음 스테이지가 열린다', () => {
  const s = makeSave();
  expect(isStageUnlocked(s, 'science', 'basic', 2)).toBe(false);
  const s2 = withCleared([['science', 'basic', 1]]);
  expect(isStageUnlocked(s2, 'science', 'basic', 2)).toBe(true);
  expect(isStageUnlocked(s2, 'science', 'basic', 3)).toBe(false);
});

test('입문 3스테이지를 모두 깨면 중급이 열린다', () => {
  const partial = withCleared([['science', 'basic', 1], ['science', 'basic', 2]]);
  expect(isTierUnlocked(partial, 'science', 'mid')).toBe(false);
  const done = withCleared([
    ['science', 'basic', 1], ['science', 'basic', 2], ['science', 'basic', 3],
  ]);
  expect(isTierUnlocked(done, 'science', 'mid')).toBe(true);
  expect(isStageUnlocked(done, 'science', 'mid', 1)).toBe(true);
  expect(isTierUnlocked(done, 'science', 'advanced')).toBe(false);
});

test('해금은 카테고리별로 따로 계산된다', () => {
  const s = withCleared([
    ['science', 'basic', 1], ['science', 'basic', 2], ['science', 'basic', 3],
  ]);
  expect(isTierUnlocked(s, 'math', 'mid')).toBe(false);
});

test('클리어 개수를 0~9로 센다', () => {
  expect(clearedCount(makeSave(), 'music')).toBe(0);
  const s = withCleared([['music', 'basic', 1], ['music', 'basic', 2]]);
  expect(clearedCount(s, 'music')).toBe(2);
});

test('잠긴 단계의 해금 조건 문구', () => {
  expect(tierUnlockHint('mid')).toBe('입문 3스테이지를 모두 깨면 열립니다');
  expect(tierUnlockHint('advanced')).toBe('중급 3스테이지를 모두 깨면 열립니다');
  expect(tierUnlockHint('basic')).toBe('처음부터 열려 있습니다');
});

test('카테고리에서 도전 가능한 다음 스테이지를 찾는다', () => {
  expect(nextStage(makeSave(), 'art')).toEqual({ tier: 'basic', stage: 1 });
  const s = withCleared([['art', 'basic', 1], ['art', 'basic', 2], ['art', 'basic', 3]]);
  expect(nextStage(s, 'art')).toEqual({ tier: 'mid', stage: 1 });
});

test('카테고리를 다 깼으면 null을 준다', () => {
  const all: [CategoryId, Tier, StageNo][] = [];
  for (const t of ['basic', 'mid', 'advanced'] as Tier[]) {
    for (const n of [1, 2, 3] as StageNo[]) all.push(['art', t, n]);
  }
  expect(nextStage(withCleared(all), 'art')).toBeNull();
});

test('이어서 하기는 최근 카테고리를 먼저 보고, 끝났으면 다른 카테고리로 넘어간다', () => {
  const fresh = makeSave();
  expect(nextStageAnywhere(fresh, null)).toEqual({
    category: 'korean-history', tier: 'basic', stage: 1,
  });
  expect(nextStageAnywhere(fresh, 'music')).toEqual({
    category: 'music', tier: 'basic', stage: 1,
  });

  const all: [CategoryId, Tier, StageNo][] = [];
  for (const t of ['basic', 'mid', 'advanced'] as Tier[]) {
    for (const n of [1, 2, 3] as StageNo[]) all.push(['music', t, n]);
  }
  const musicDone = withCleared(all);
  expect(nextStageAnywhere(musicDone, 'music')?.category).not.toBe('music');
});
