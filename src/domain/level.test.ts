import { getLevel } from './level';

test('0원이면 Lv.1 상식 새싹', () => {
  const r = getLevel(0);
  expect(r.level).toBe(1);
  expect(r.title).toBe('상식 새싹');
});

test('임계값과 정확히 같으면 그 레벨로 오른다', () => {
  expect(getLevel(100_000).level).toBe(2);
  expect(getLevel(1_000_000).level).toBe(6);
  expect(getLevel(1_000_000).title).toBe('마을 백과사전');
});

test('임계값보다 1원 적으면 아직 이전 레벨', () => {
  expect(getLevel(99_999).level).toBe(1);
  expect(getLevel(999_999).level).toBe(5);
});

test('다음 레벨까지 남은 금액을 알려준다', () => {
  const r = getLevel(600_000);
  expect(r.level).toBe(4);
  expect(r.nextThreshold).toBe(700_000);
  expect(r.remaining).toBe(100_000);
});

test('최고 레벨에서는 다음 레벨이 없다', () => {
  const r = getLevel(9_000_000);
  expect(r.level).toBe(15);
  expect(r.nextThreshold).toBeNull();
  expect(r.remaining).toBeNull();
});
