import type {
  AvatarId, CategoryId, Question, SaveState, StageNo, ThemeId, Tier,
} from '../types';
import { stageKey } from '../types';
import { defaultSave } from '../storage/save';
import {
  dailyPrizeLines, reviewPrizeLines, stagePrizeLines, sumLines, type PrizeLine,
} from '../domain/scoring';
import {
  advance, answerCurrent, applyItem, canUseItem, correctCount, isCleared,
  ITEM_PRICE, startSession, type ItemId, type QuizSession, type SessionMode,
} from '../domain/quizSession';
import { addWrongNote, recordAnswer, resolveWrongNote } from '../domain/wrongNotes';
import { awardBadges, newlyEarnedBadges } from '../domain/badges';
import { getLevel } from '../domain/level';
import { isDailyBonusEligible, mulberry32 } from '../domain/dailyGame';
import { nextStage } from '../domain/unlock';
import { THEMES, AVATARS } from '../data/shop';
import { FURNITURE_BY_ID } from '../data/furniture';
import { OUTFIT_BY_ID } from '../data/outfits';
import type { OutfitSlot, RoomSlot } from '../types';

export type StorageWarning = 'none' | 'corrupted' | 'unavailable';

export type ResultSummary = {
  mode: SessionMode;
  correctCount: number;
  total: number;
  cleared: boolean;
  lines: PrizeLine[];
  totalPrize: number;
  newBadges: string[];
  levelUp: { level: number; title: string } | null;
  next: { tier: Tier; stage: StageNo } | null;
};

export type AppState = {
  save: SaveState;
  session: QuizSession | null;
  lastResult: ResultSummary | null;
  storageWarning: StorageWarning;
};

export type Action =
  | { type: 'START_STAGE'; category: CategoryId; tier: Tier; stage: StageNo; questions: Question[] }
  | { type: 'START_DAILY'; questions: Question[] }
  | { type: 'START_REVIEW'; questions: Question[] }
  | { type: 'USE_ITEM'; item: ItemId }
  | { type: 'ANSWER'; choiceIndex: number }
  | { type: 'NEXT' }
  | { type: 'FINISH'; today: string }
  | { type: 'ABANDON' }
  | { type: 'CLEAR_RESULT' }
  | { type: 'BUY_THEME'; theme: ThemeId }
  | { type: 'BUY_AVATAR'; avatar: AvatarId }
  | { type: 'BUY_FURNITURE'; id: string }
  | { type: 'PLACE_FURNITURE'; slot: RoomSlot; id: string | null }
  | { type: 'BUY_OUTFIT'; id: string }
  | { type: 'WEAR_OUTFIT'; slot: OutfitSlot; id: string | null }
  | { type: 'SET_THEME'; theme: ThemeId }
  | { type: 'SET_AVATAR'; avatar: AvatarId }
  | { type: 'RESET_ALL' }
  | { type: 'IMPORT_SAVE'; save: SaveState };

export function initialAppState(save: SaveState, warning: StorageWarning): AppState {
  return { save, session: null, lastResult: null, storageWarning: warning };
}

function alreadyCorrectFlags(save: SaveState, questions: Question[]): boolean[] {
  return questions.map((q) => (save.questionStats[q.id]?.correct ?? 0) > 0);
}

function beginSession(
  state: AppState, mode: SessionMode, questions: Question[],
): AppState {
  return {
    ...state,
    session: startSession(mode, questions, alreadyCorrectFlags(state.save, questions)),
    lastResult: null,
  };
}

function finish(state: AppState, today: string): AppState {
  const session = state.session;
  if (!session) return state;

  const { questions, results, alreadyCorrect, mode } = session;
  const correct = correctCount(session);
  const cleared = isCleared(session);

  let save = state.save;
  const levelBefore = getLevel(save.totalPrize).level;

  // 문제별 통계와 오답노트
  questions.forEach((q, i) => {
    const r = results[i];
    save = recordAnswer(save, q.id, r === 'correct');
    if (r === 'correct') {
      if (mode.kind === 'review') save = resolveWrongNote(save, q.id);
    } else {
      save = addWrongNote(save, q.id);
    }
  });

  // 상금 내역
  let lines: PrizeLine[] = [];
  if (mode.kind === 'stage') {
    const key = stageKey(mode.category, mode.tier, mode.stage);
    const prev = save.stages[key];
    lines = stagePrizeLines({
      questions,
      results,
      alreadyCorrect,
      firstClear: cleared && !(prev?.cleared ?? false),
      perfectFirstTime: (prev?.bestCorrect ?? 0) < questions.length,
      cleared,
    });
    save = {
      ...save,
      stages: {
        ...save.stages,
        [key]: {
          cleared: (prev?.cleared ?? false) || cleared,
          bestCorrect: Math.max(prev?.bestCorrect ?? 0, correct),
          plays: (prev?.plays ?? 0) + 1,
        },
      },
      perfectCount: save.perfectCount + (correct === questions.length ? 1 : 0),
      lastPlayed: { category: mode.category, tier: mode.tier, stage: mode.stage },
    };
  } else if (mode.kind === 'daily') {
    const eligible = isDailyBonusEligible(save, today);
    lines = dailyPrizeLines({ questions, results, alreadyCorrect, bonusEligible: eligible });
    save = {
      ...save,
      dailyGame: {
        lastBonusDate: eligible ? today : save.dailyGame.lastBonusDate,
        completed: save.dailyGame.completed + 1,
      },
    };
  } else {
    lines = reviewPrizeLines(correct);
  }

  const earned = sumLines(lines);
  save = { ...save, totalPrize: save.totalPrize + earned, wallet: save.wallet + earned };

  const fresh = newlyEarnedBadges(save).map((b) => b.id);
  save = awardBadges(save, fresh, today);

  const after = getLevel(save.totalPrize);
  const levelUp = after.level > levelBefore
    ? { level: after.level, title: after.title }
    : null;

  return {
    ...state,
    save,
    session: null,
    lastResult: {
      mode,
      correctCount: correct,
      total: questions.length,
      cleared,
      lines,
      totalPrize: earned,
      newBadges: fresh,
      levelUp,
      next: mode.kind === 'stage' ? nextStage(save, mode.category) : null,
    },
  };
}

export function gameReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_STAGE':
      return beginSession(
        state,
        { kind: 'stage', category: action.category, tier: action.tier, stage: action.stage },
        action.questions,
      );

    case 'START_DAILY':
      return beginSession(state, { kind: 'daily' }, action.questions);

    case 'START_REVIEW':
      return beginSession(state, { kind: 'review' }, action.questions);

    case 'USE_ITEM': {
      const session = state.session;
      if (!session) return state;
      if (!canUseItem(session, action.item, state.save.wallet)) return state;
      return {
        ...state,
        session: applyItem(session, action.item, mulberry32(Date.now() & 0xffff)),
        save: { ...state.save, wallet: state.save.wallet - ITEM_PRICE[action.item] },
      };
    }

    case 'ANSWER':
      if (!state.session) return state;
      return { ...state, session: answerCurrent(state.session, action.choiceIndex) };

    case 'NEXT':
      if (!state.session) return state;
      return { ...state, session: advance(state.session) };

    case 'FINISH':
      return finish(state, action.today);

    case 'ABANDON':
      return { ...state, session: null, lastResult: null };

    case 'CLEAR_RESULT':
      return { ...state, lastResult: null };

    case 'BUY_THEME': {
      const theme = THEMES.find((t) => t.id === action.theme);
      if (!theme) return state;
      if (state.save.owned.themes.includes(action.theme)) return state;
      if (state.save.wallet < theme.price) return state;
      return {
        ...state,
        save: {
          ...state.save,
          wallet: state.save.wallet - theme.price,
          owned: { ...state.save.owned, themes: [...state.save.owned.themes, action.theme] },
        },
      };
    }

    case 'BUY_AVATAR': {
      const avatar = AVATARS.find((a) => a.id === action.avatar);
      if (!avatar) return state;
      if (state.save.owned.avatars.includes(action.avatar)) return state;
      if (state.save.wallet < avatar.price) return state;
      return {
        ...state,
        save: {
          ...state.save,
          wallet: state.save.wallet - avatar.price,
          owned: { ...state.save.owned, avatars: [...state.save.owned.avatars, action.avatar] },
        },
      };
    }

    case 'SET_THEME':
      if (!state.save.owned.themes.includes(action.theme)) return state;
      return {
        ...state,
        save: { ...state.save, settings: { ...state.save.settings, theme: action.theme } },
      };

    case 'SET_AVATAR':
      if (!state.save.owned.avatars.includes(action.avatar)) return state;
      return {
        ...state,
        save: { ...state.save, settings: { ...state.save.settings, avatar: action.avatar } },
      };

    case 'BUY_FURNITURE': {
      const item = FURNITURE_BY_ID[action.id];
      if (!item) return state;
      if (state.save.owned.furniture.includes(item.id)) return state;
      if (state.save.wallet < item.price) return state;
      if (getLevel(state.save.totalPrize).level < item.unlockLevel) return state;
      return {
        ...state,
        save: {
          ...state.save,
          wallet: state.save.wallet - item.price,
          owned: { ...state.save.owned, furniture: [...state.save.owned.furniture, item.id] },
          // 산 가구는 바로 제자리에 놓는다
          settings: {
            ...state.save.settings,
            room: { ...state.save.settings.room, [item.slot]: item.id },
          },
        },
      };
    }

    case 'PLACE_FURNITURE': {
      if (action.id !== null) {
        const item = FURNITURE_BY_ID[action.id];
        if (!item || item.slot !== action.slot) return state;
        if (!state.save.owned.furniture.includes(item.id)) return state;
      }
      const room = { ...state.save.settings.room };
      if (action.id === null) delete room[action.slot];
      else room[action.slot] = action.id;
      return {
        ...state,
        save: { ...state.save, settings: { ...state.save.settings, room } },
      };
    }

    case 'BUY_OUTFIT': {
      const item = OUTFIT_BY_ID[action.id];
      if (!item) return state;
      if (state.save.owned.outfits.includes(item.id)) return state;
      if (state.save.wallet < item.price) return state;
      if (getLevel(state.save.totalPrize).level < item.unlockLevel) return state;
      return {
        ...state,
        save: {
          ...state.save,
          wallet: state.save.wallet - item.price,
          owned: { ...state.save.owned, outfits: [...state.save.owned.outfits, item.id] },
          settings: {
            ...state.save.settings,
            outfit: { ...state.save.settings.outfit, [item.slot]: item.id },
          },
        },
      };
    }

    case 'WEAR_OUTFIT': {
      if (action.id !== null) {
        const item = OUTFIT_BY_ID[action.id];
        if (!item || item.slot !== action.slot) return state;
        if (!state.save.owned.outfits.includes(item.id)) return state;
      }
      const outfit = { ...state.save.settings.outfit };
      if (action.id === null) delete outfit[action.slot];
      else outfit[action.slot] = action.id;
      return {
        ...state,
        save: { ...state.save, settings: { ...state.save.settings, outfit } },
      };
    }

    case 'RESET_ALL':
      return { ...state, save: defaultSave(), session: null, lastResult: null };

    case 'IMPORT_SAVE':
      return { ...state, save: action.save, session: null, lastResult: null };

    default:
      return state;
  }
}
