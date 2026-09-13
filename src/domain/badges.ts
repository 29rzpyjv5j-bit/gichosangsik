import type { SaveState } from '../types';
import { BADGES, type Badge } from '../data/badges';

export function hasBadge(state: SaveState, id: string): boolean {
  return state.badges.some((b) => b.id === id);
}

export function newlyEarnedBadges(state: SaveState): Badge[] {
  return BADGES.filter((b) => b.earned(state) && !hasBadge(state, b.id));
}

export function awardBadges(state: SaveState, ids: string[], today: string): SaveState {
  const fresh = ids.filter((id) => !hasBadge(state, id));
  if (fresh.length === 0) return state;
  return {
    ...state,
    badges: [...state.badges, ...fresh.map((id) => ({ id, earnedAt: today }))],
  };
}
