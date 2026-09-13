export type CategoryId =
  | 'korean-history' | 'world-history' | 'science'
  | 'math' | 'music' | 'art' | 'current-affairs';

export type Tier = 'basic' | 'mid' | 'advanced';
export type StageNo = 1 | 2 | 3;

export const TIERS: Tier[] = ['basic', 'mid', 'advanced'];
export const TIER_NAMES: Record<Tier, string> = {
  basic: '입문',
  mid: '중급',
  advanced: '상급',
};

export type Question = {
  id: string;
  category: CategoryId;
  tier: Tier;
  stage: StageNo;
  type: 'choice' | 'ox';
  prompt: string;
  choices: string[];
  answerIndex: number;
  hint: string;
  explanation: string;
  writtenAt: string;
};

export type CategoryInfo = {
  id: CategoryId;
  name: string;
  emoji: string;
  stageTitles: Record<Tier, [string, string, string]>;
};

export type LevelInfo = { level: number; title: string; threshold: number };

export type ThemeId = 'default' | 'apricot' | 'lavender' | 'ocean' | 'night';
export type AvatarId = 'smile' | 'chick' | 'owl' | 'fox' | 'panda' | 'lion';

export type StageRecord = { cleared: boolean; bestCorrect: number; plays: number };

export type SaveState = {
  version: 1;
  totalPrize: number;
  wallet: number;
  stages: Record<string, StageRecord>;
  questionStats: Record<string, { correct: number; wrong: number }>;
  wrongNotes: string[];
  wrongNotesResolved: number;
  wrongNotesEverAdded: number;
  perfectCount: number;
  dailyGame: { lastBonusDate: string | null; completed: number };
  badges: { id: string; earnedAt: string }[];
  owned: { themes: ThemeId[]; avatars: AvatarId[] };
  settings: { theme: ThemeId; avatar: AvatarId };
  lastPlayed: { category: CategoryId; tier: Tier; stage: StageNo } | null;
};

export function stageKey(category: CategoryId, tier: Tier, stage: StageNo): string {
  return `${category}-${tier}-${stage}`;
}
