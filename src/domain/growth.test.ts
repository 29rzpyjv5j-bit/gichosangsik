import { growthStageOf, nextGrowthStage } from './growth';

test('레벨 경계에서 성장 단계가 바뀐다', () => {
  expect(growthStageOf(1).name).toBe('알');
  expect(growthStageOf(2).name).toBe('알');
  expect(growthStageOf(3).name).toBe('아기 펭귄');
  expect(growthStageOf(9).name).toBe('꼬마 펭귄');
  expect(growthStageOf(10).name).toBe('펭귄');
  expect(growthStageOf(15).name).toBe('박사 펭귄');
});

test('다음 성장 단계를 알려주고, 마지막 단계에서는 없다', () => {
  expect(nextGrowthStage(4)?.fromLevel).toBe(6);
  expect(nextGrowthStage(13)).toBeNull();
});
