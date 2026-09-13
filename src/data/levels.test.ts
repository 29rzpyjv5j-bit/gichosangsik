import { LEVELS } from './levels';

test('레벨은 15개이고 1부터 순서대로 번호가 붙는다', () => {
  expect(LEVELS).toHaveLength(15);
  expect(LEVELS.map((l) => l.level)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
});

test('임계값은 0에서 시작해 단조 증가한다', () => {
  expect(LEVELS[0].threshold).toBe(0);
  for (let i = 1; i < LEVELS.length; i++) {
    expect(LEVELS[i].threshold).toBeGreaterThan(LEVELS[i - 1].threshold);
  }
});

test('스펙에 적힌 칭호와 임계값이 그대로 들어 있다', () => {
  expect(LEVELS[5]).toEqual({ level: 6, title: '마을 백과사전', threshold: 1_000_000 });
  expect(LEVELS[14]).toEqual({ level: 15, title: '자기님, 상식의 신', threshold: 8_200_000 });
});
