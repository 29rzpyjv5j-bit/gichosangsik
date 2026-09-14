import type { Question, SaveState } from '../types';

export function makeSave(partial: Partial<SaveState> = {}): SaveState {
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
    ...partial,
  };
}

export function makeQuestion(partial: Partial<Question> = {}): Question {
  return {
    id: 'sc-b-01',
    category: 'science',
    tier: 'basic',
    stage: 1,
    type: 'choice',
    prompt: '물의 끓는점은 몇 도일까요?',
    choices: ['50도', '80도', '100도', '120도'],
    answerIndex: 2,
    hint: '1기압에서 기준이 되는 온도예요.',
    explanation: '1기압에서 물은 100도에 끓습니다.',
    writtenAt: '2026-09',
    ...partial,
  };
}
