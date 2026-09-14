import type { CategoryId, SaveState, StageNo, Tier } from '../types';
import { CATEGORIES } from './categories';
import { clearedCount, isStageCleared } from '../domain/unlock';
import { getLevel } from '../domain/level';

export type BadgeGroup = 'category' | 'tier' | 'perfect' | 'wrong' | 'daily' | 'level';

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  group: BadgeGroup;
  earned: (s: SaveState) => boolean;
  progress: (s: SaveState) => string;
};

export const BADGE_GRADIENT: Record<BadgeGroup, string> = {
  category: 'linear-gradient(160deg, #7ee06b, #4fb302)',
  tier: 'linear-gradient(160deg, #6cc9ff, #1899d6)',
  perfect: 'linear-gradient(160deg, #ffd95e, #f0a800)',
  wrong: 'linear-gradient(160deg, #ffab7a, #f2762e)',
  daily: 'linear-gradient(160deg, #9ee7ef, #2fb6c9)',
  level: 'linear-gradient(160deg, #c3a6f5, #8b6fd6)',
};

const STAGES: StageNo[] = [1, 2, 3];

function tierClearedEverywhere(s: SaveState, tier: Tier): boolean {
  return CATEGORIES.every((c) => STAGES.every((n) => isStageCleared(s, c.id, tier, n)));
}

function tierClearedCount(s: SaveState, tier: Tier): number {
  let n = 0;
  for (const c of CATEGORIES) {
    for (const st of STAGES) if (isStageCleared(s, c.id, tier, st)) n += 1;
  }
  return n;
}

const categoryBadges: Badge[] = CATEGORIES.map((c) => ({
  id: `master-${c.id}`,
  name: `${c.name} 마스터`,
  emoji: c.emoji,
  group: 'category' as BadgeGroup,
  earned: (s: SaveState) => clearedCount(s, c.id as CategoryId) === 9,
  progress: (s: SaveState) => `클리어 ${clearedCount(s, c.id as CategoryId)}/9`,
}));

const tierMeta: { tier: Tier; id: string; name: string; emoji: string }[] = [
  { tier: 'basic', id: 'graduate-basic', name: '입문 졸업', emoji: '🌱' },
  { tier: 'mid', id: 'graduate-mid', name: '중급 졸업', emoji: '🌿' },
  { tier: 'advanced', id: 'graduate-advanced', name: '상급 졸업', emoji: '🌳' },
];

const tierBadges: Badge[] = tierMeta.map((m) => ({
  id: m.id,
  name: m.name,
  emoji: m.emoji,
  group: 'tier' as BadgeGroup,
  earned: (s: SaveState) => tierClearedEverywhere(s, m.tier),
  progress: (s: SaveState) => `클리어 ${tierClearedCount(s, m.tier)}/21`,
}));

const perfectBadges: Badge[] = [
  { id: 'perfect-1', name: '첫 만점', emoji: '⭐', need: 1 },
  { id: 'perfect-10', name: '만점 10회', emoji: '🌟', need: 10 },
  { id: 'perfect-30', name: '만점 30회', emoji: '✨', need: 30 },
].map((m) => ({
  id: m.id,
  name: m.name,
  emoji: m.emoji,
  group: 'perfect' as BadgeGroup,
  earned: (s: SaveState) => s.perfectCount >= m.need,
  progress: (s: SaveState) => `${s.perfectCount}/${m.need}`,
}));

const dailyBadges: Badge[] = [
  { id: 'daily-7', name: '섞어 풀기 7회', emoji: '📅', need: 7 },
  { id: 'daily-30', name: '섞어 풀기 30회', emoji: '🗓️', need: 30 },
].map((m) => ({
  id: m.id,
  name: m.name,
  emoji: m.emoji,
  group: 'daily' as BadgeGroup,
  earned: (s: SaveState) => s.dailyGame.completed >= m.need,
  progress: (s: SaveState) => `${s.dailyGame.completed}/${m.need}`,
}));

const wrongBadges: Badge[] = [
  {
    id: 'wrong-10',
    name: '오답 10개 극복',
    emoji: '🩹',
    group: 'wrong' as BadgeGroup,
    earned: (s: SaveState) => s.wrongNotesResolved >= 10,
    progress: (s: SaveState) => `${s.wrongNotesResolved}/10`,
  },
  {
    id: 'wrong-empty',
    name: '오답노트 비우기',
    emoji: '🧹',
    group: 'wrong' as BadgeGroup,
    earned: (s: SaveState) => s.wrongNotesEverAdded > 0 && s.wrongNotes.length === 0,
    progress: (s: SaveState) =>
      s.wrongNotesEverAdded === 0 ? '오답이 쌓이면 시작' : `남은 오답 ${s.wrongNotes.length}개`,
  },
];

const levelBadges: Badge[] = [
  {
    id: 'level-10',
    name: '척척박사',
    emoji: '🎓',
    group: 'level' as BadgeGroup,
    earned: (s: SaveState) => getLevel(s.totalPrize).level >= 10,
    progress: (s: SaveState) => `Lv.${getLevel(s.totalPrize).level}`,
  },
];

export const BADGES: Badge[] = [
  ...categoryBadges,
  ...tierBadges,
  ...perfectBadges,
  ...wrongBadges,
  ...dailyBadges,
  ...levelBadges,
];

export const BADGE_BY_ID: Record<string, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);
