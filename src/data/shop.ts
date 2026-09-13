import type { AvatarId, ThemeId } from '../types';

export type ThemeItem = { id: ThemeId; name: string; price: number };
export type AvatarItem = { id: AvatarId; emoji: string; price: number };

export const THEMES: ThemeItem[] = [
  { id: 'default', name: '기본 파스텔', price: 0 },
  { id: 'apricot', name: '살구빛', price: 300_000 },
  { id: 'lavender', name: '라벤더', price: 500_000 },
  { id: 'ocean', name: '바다', price: 700_000 },
  { id: 'night', name: '야간모드', price: 1_000_000 },
];

export const AVATARS: AvatarItem[] = [
  { id: 'smile', emoji: '🙂', price: 0 },
  { id: 'chick', emoji: '🐣', price: 0 },
  { id: 'owl', emoji: '🦉', price: 0 },
  { id: 'fox', emoji: '🦊', price: 200_000 },
  { id: 'panda', emoji: '🐼', price: 400_000 },
  { id: 'lion', emoji: '🦁', price: 600_000 },
];

export const THEME_BY_ID: Record<ThemeId, ThemeItem> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
) as Record<ThemeId, ThemeItem>;
