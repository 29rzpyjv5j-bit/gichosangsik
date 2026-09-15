import type { CategoryId, Question, StageNo, Tier } from '../../types';

import { koreanHistory } from './korean-history';
import { science } from './science';
import { worldHistory } from './world-history';
import { math } from './math';
import koreanHistoryBank from './korean-history-bank.json';
import worldHistoryBank from './world-history-bank.json';

// 문제 파일을 집필할 때마다 아래에 등록한다.
export const BANK: Partial<Record<CategoryId, Question[]>> = {
  'korean-history': [...koreanHistory, ...(koreanHistoryBank as Question[])],
  science,
  'world-history': [...worldHistory, ...(worldHistoryBank as Question[])],
  math,
};

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
