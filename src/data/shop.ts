import type { AvatarId, ThemeId } from '../types';

export type ThemeItem = { id: ThemeId; name: string; price: number; wall: string; floor: string };
export type AvatarItem = { id: AvatarId; emoji: string; price: number };

// 예전 앱 테마 5종은 방 벽지로 판다
export const THEMES: ThemeItem[] = [
  { id: 'default', name: '기본 크림', price: 0, wall: '#ffeadd', floor: '#f6c9a8' },
  { id: 'apricot', name: '살구빛', price: 300_000, wall: '#ffd9bf', floor: '#efb994' },
  { id: 'lavender', name: '라벤더', price: 500_000, wall: '#e3daff', floor: '#f2c6a6' },
  { id: 'ocean', name: '바다', price: 700_000, wall: '#cfeefa', floor: '#e9c39f' },
  { id: 'night', name: '밤하늘', price: 1_000_000, wall: '#3b4668', floor: '#c79b7a' },
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
