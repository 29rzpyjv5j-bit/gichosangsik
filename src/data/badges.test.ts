import { BADGES, BADGE_GRADIENT } from './badges';
import { makeSave } from '../test/factories';
import { stageKey, TIERS } from '../types';
import type { CategoryId, SaveState, StageNo } from '../types';
import { CATEGORIES } from './categories';

function clearAll(categories: CategoryId[], tiers = TIERS): SaveState {
  const stages: SaveState['stages'] = {};
  for (const c of categories) {
    for (const t of tiers) {
      for (const s of [1, 2, 3] as StageNo[]) {
        stages[stageKey(c, t, s)] = { cleared: true, bestCorrect: 5, plays: 1 };
      }
    }
  }
  return makeSave({ stages });
}

test('뱃지는 18개이고 id가 유일하다', () => {
  expect(BADGES).toHaveLength(18);
  expect(new Set(BADGES.map((b) => b.id)).size).toBe(18);
});

test('분류별 개수가 스펙과 맞는다', () => {
  const count = (g: string) => BADGES.filter((b) => b.group === g).length;
  expect(count('category')).toBe(7);
  expect(count('tier')).toBe(3);
  expect(count('perfect')).toBe(3);
  expect(count('wrong')).toBe(2);
  expect(count('daily')).toBe(2);
  expect(count('level')).toBe(1);
});

test('분류마다 그라데이션 색이 정의돼 있다', () => {
  for (const b of BADGES) {
    expect(BADGE_GRADIENT[b.group]).toMatch(/linear-gradient/);
  }
});

test('갓 시작한 상태에서는 어떤 뱃지도 획득되지 않는다', () => {
  const s = makeSave();
  for (const b of BADGES) expect(b.earned(s)).toBe(false);
});

test('카테고리 9스테이지를 다 깨면 그 카테고리 마스터 뱃지를 얻는다', () => {
  const s = clearAll(['science']);
  const badge = BADGES.find((b) => b.id === 'master-science')!;
  expect(badge.earned(s)).toBe(true);
  expect(BADGES.find((b) => b.id === 'master-math')!.earned(s)).toBe(false);
});

test('7개 카테고리 입문을 다 깨면 입문 졸업 뱃지를 얻는다', () => {
  const ids = CATEGORIES.map((c) => c.id);
  const s = clearAll(ids, ['basic']);
  expect(BADGES.find((b) => b.id === 'graduate-basic')!.earned(s)).toBe(true);
  expect(BADGES.find((b) => b.id === 'graduate-mid')!.earned(s)).toBe(false);
});

test('만점 뱃지는 누적 만점 횟수로 판정한다', () => {
  const first = BADGES.find((b) => b.id === 'perfect-1')!;
  const ten = BADGES.find((b) => b.id === 'perfect-10')!;
  expect(first.earned(makeSave({ perfectCount: 1 }))).toBe(true);
  expect(ten.earned(makeSave({ perfectCount: 9 }))).toBe(false);
  expect(ten.earned(makeSave({ perfectCount: 10 }))).toBe(true);
});

test('오답노트 비우기는 오답이 쌓인 적이 있고 지금 0개일 때만 얻는다', () => {
  const badge = BADGES.find((b) => b.id === 'wrong-empty')!;
  expect(badge.earned(makeSave())).toBe(false);
  expect(badge.earned(makeSave({ wrongNotesEverAdded: 3, wrongNotes: ['a'] }))).toBe(false);
  expect(badge.earned(makeSave({ wrongNotesEverAdded: 3, wrongNotes: [] }))).toBe(true);
});

test('레벨 뱃지는 Lv.10 도달로 판정한다', () => {
  const badge = BADGES.find((b) => b.id === 'level-10')!;
  expect(badge.earned(makeSave({ totalPrize: 3_199_999 }))).toBe(false);
  expect(badge.earned(makeSave({ totalPrize: 3_200_000 }))).toBe(true);
});

test('미획득 뱃지는 진행률 문구를 준다', () => {
  expect(BADGES.find((b) => b.id === 'perfect-10')!.progress(makeSave({ perfectCount: 3 })))
    .toBe('3/10');
  expect(BADGES.find((b) => b.id === 'daily-30')!.progress(
    makeSave({ dailyGame: { lastBonusDate: null, completed: 9 } }),
  )).toBe('9/30');
  expect(BADGES.find((b) => b.id === 'master-science')!.progress(makeSave()))
    .toBe('클리어 0/9');
  expect(BADGES.find((b) => b.id === 'wrong-empty')!.progress(
    makeSave({ wrongNotesEverAdded: 2, wrongNotes: ['a', 'b'] }),
  )).toBe('남은 오답 2개');
  expect(BADGES.find((b) => b.id === 'level-10')!.progress(makeSave())).toBe('Lv.1');
});
