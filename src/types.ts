export type CategoryId =
  | 'korean-history' | 'world-history' | 'science'
  | 'math' | 'music' | 'art' | 'current-affairs';

export type Tier = 'basic' | 'mid' | 'advanced';
// 스테이지 번호는 1부터. 카테고리·단계마다 스테이지 수가 다르다 (stageTitles 길이).
export type StageNo = number;

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
  stageTitles: Record<Tier, string[]>;
};

export type LevelInfo = { level: number; title: string; threshold: number };

export type ThemeId = 'default' | 'apricot' | 'lavender' | 'ocean' | 'night';
export type AvatarId = 'smile' | 'chick' | 'owl' | 'fox' | 'panda' | 'lion';

export type RoomSlot = 'wall' | 'left' | 'right' | 'rug';
export type OutfitSlot = 'hat' | 'neck' | 'face';

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
  owned: { themes: ThemeId[]; avatars: AvatarId[]; furniture: string[]; outfits: string[] };
  settings: { theme: ThemeId; avatar: AvatarId; room: Partial<Record<RoomSlot, string>>; outfit: Partial<Record<OutfitSlot, string>> };
  lastPlayed: { category: CategoryId; tier: Tier; stage: StageNo } | null;
};

export function stageKey(category: CategoryId, tier: Tier, stage: StageNo): string {
  return `${category}-${tier}-${stage}`;
}
