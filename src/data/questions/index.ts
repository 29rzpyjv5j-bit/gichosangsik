import type { CategoryId, Question, StageNo, Tier } from '../../types';

// 문제 파일을 집필할 때마다 아래에 등록한다.
// 예: import { koreanHistory } from './korean-history';
export const BANK: Partial<Record<CategoryId, Question[]>> = {};

export const REGISTERED_CATEGORIES = Object.keys(BANK) as CategoryId[];

export const ALL_QUESTIONS: Question[] = Object.values(BANK).flat() as Question[];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, q]),
);

export function questionsOfStage(
  category: CategoryId, tier: Tier, stage: StageNo,
): Question[] {
  return (BANK[category] ?? []).filter((q) => q.tier === tier && q.stage === stage);
}
