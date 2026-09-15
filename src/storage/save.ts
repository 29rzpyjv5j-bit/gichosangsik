import type { SaveState } from '../types';

export const STORAGE_KEY = 'gs.v1.state';

export function defaultSave(): SaveState {
  return {
    version: 1,
    totalPrize: 0,
    wallet: 0,
    stages: {},
    questionStats: {},
    wrongNotes: [],
    wrongNotesResolved: 0,
    wrongNotesEverAdded: 0,
    perfectCount: 0,
    dailyGame: { lastBonusDate: null, completed: 0 },
    badges: [],
    owned: { themes: ['default'], avatars: ['smile', 'chick', 'owl'], furniture: [], outfits: [] },
    settings: { theme: 'default', avatar: 'smile', room: {}, outfit: {} },
    lastPlayed: null,
  };
}

function merge(raw: unknown): SaveState {
  const base = defaultSave();
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Partial<SaveState>;
  return {
    ...base,
    ...r,
    dailyGame: { ...base.dailyGame, ...(r.dailyGame ?? {}) },
    owned: { ...base.owned, ...(r.owned ?? {}) },
    settings: { ...base.settings, ...(r.settings ?? {}) },
    version: 1,
  };
}

export function loadSave(): { state: SaveState; warning: 'none' | 'corrupted' | 'unavailable' } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: defaultSave(), warning: 'unavailable' };
  }
  if (raw === null) return { state: defaultSave(), warning: 'none' };
  try {
    return { state: merge(JSON.parse(raw)), warning: 'none' };
  } catch {
    return { state: defaultSave(), warning: 'corrupted' };
  }
}

export function saveSave(state: SaveState): 'ok' | 'unavailable' {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return 'ok';
  } catch {
    return 'unavailable';
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 쓸 수 없는 환경이면 지울 것도 없다 */
  }
}

const BACKUP_PREFIX = 'GS1-';

// 기록을 다른 기기·앱으로 옮길 수 있는 문자열로 만든다
export function encodeBackup(state: SaveState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return BACKUP_PREFIX + btoa(bin);
}

export function decodeBackup(code: string): SaveState | null {
  const trimmed = code.replace(/\s+/g, '');
  if (!trimmed.startsWith(BACKUP_PREFIX)) return null;
  try {
    const bin = atob(trimmed.slice(BACKUP_PREFIX.length));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const raw = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof raw?.totalPrize !== 'number' || typeof raw?.wallet !== 'number' || typeof raw?.stages !== 'object') {
      return null;
    }
    return merge(raw);
  } catch {
    return null;
  }
}
