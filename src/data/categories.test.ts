import { CATEGORIES } from './categories';
import { TIERS } from '../types';

test('카테고리는 7개다', () => {
  expect(CATEGORIES).toHaveLength(7);
});

test('카테고리 id가 유일하다', () => {
  const ids = CATEGORIES.map((c) => c.id);
  expect(new Set(ids).size).toBe(7);
});

test('카테고리마다 단계별 스테이지 제목이 3개씩 있다', () => {
  for (const c of CATEGORIES) {
    for (const tier of TIERS) {
      expect(c.stageTitles[tier]).toHaveLength(3);
      for (const title of c.stageTitles[tier]) {
        expect(title.length).toBeGreaterThan(0);
      }
    }
  }
});
