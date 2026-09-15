import { BANK, ALL_QUESTIONS, REGISTERED_CATEGORIES, questionsOfStage } from './index';
import { validateQuestions } from './validate';
import type { CategoryId } from '../../types';

test('등록된 모든 카테고리가 검증을 통과한다', () => {
  for (const category of REGISTERED_CATEGORIES) {
    const errors = validateQuestions(BANK[category]!, category as CategoryId);
    expect(errors, `${category}:\n${errors.join('\n')}`).toEqual([]);
  }
});

test('전체 문제 id가 유일하다', () => {
  const ids = ALL_QUESTIONS.map((q) => q.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('등록된 카테고리의 스테이지는 5문제씩이다', () => {
  for (const category of REGISTERED_CATEGORIES) {
    expect(questionsOfStage(category as CategoryId, 'basic', 1)).toHaveLength(5);
  }
});

test('한국사·세계사는 문제은행 600문항이 합쳐져 645문항이다', () => {
  expect(BANK['korean-history']).toHaveLength(645);
  expect(BANK['world-history']).toHaveLength(645);
  expect(questionsOfStage('korean-history', 'advanced', 63)).toHaveLength(5);
});
