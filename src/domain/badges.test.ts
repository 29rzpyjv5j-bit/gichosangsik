import { newlyEarnedBadges, awardBadges, hasBadge } from './badges';
import { makeSave } from '../test/factories';

test('조건을 채우면 새 뱃지로 잡힌다', () => {
  const s = makeSave({ perfectCount: 1 });
  expect(newlyEarnedBadges(s).map((b) => b.id)).toEqual(['perfect-1']);
});

test('이미 받은 뱃지는 다시 잡히지 않는다', () => {
  const s = makeSave({
    perfectCount: 1,
    badges: [{ id: 'perfect-1', earnedAt: '2026-09-13' }],
  });
  expect(newlyEarnedBadges(s)).toEqual([]);
});

test('뱃지를 지급하면 획득일과 함께 저장된다', () => {
  const s = awardBadges(makeSave({ perfectCount: 1 }), ['perfect-1'], '2026-09-13');
  expect(s.badges).toEqual([{ id: 'perfect-1', earnedAt: '2026-09-13' }]);
  expect(hasBadge(s, 'perfect-1')).toBe(true);
});

test('같은 뱃지를 두 번 지급해도 하나만 남는다', () => {
  let s = awardBadges(makeSave(), ['perfect-1'], '2026-09-13');
  s = awardBadges(s, ['perfect-1'], '2026-09-14');
  expect(s.badges).toHaveLength(1);
  expect(s.badges[0].earnedAt).toBe('2026-09-13');
});

test('여러 뱃지가 동시에 잡힌다', () => {
  const s = makeSave({
    perfectCount: 10,
    wrongNotesEverAdded: 5,
    wrongNotes: [],
    wrongNotesResolved: 10,
  });
  const ids = newlyEarnedBadges(s).map((b) => b.id);
  expect(ids).toContain('perfect-1');
  expect(ids).toContain('perfect-10');
  expect(ids).toContain('wrong-10');
  expect(ids).toContain('wrong-empty');
});
