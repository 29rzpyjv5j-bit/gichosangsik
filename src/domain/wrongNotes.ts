import type { SaveState } from '../types';

export function addWrongNote(state: SaveState, questionId: string): SaveState {
  if (state.wrongNotes.includes(questionId)) return state;
  return {
    ...state,
    wrongNotes: [...state.wrongNotes, questionId],
    wrongNotesEverAdded: state.wrongNotesEverAdded + 1,
  };
}

export function resolveWrongNote(state: SaveState, questionId: string): SaveState {
  if (!state.wrongNotes.includes(questionId)) return state;
  return {
    ...state,
    wrongNotes: state.wrongNotes.filter((id) => id !== questionId),
    wrongNotesResolved: state.wrongNotesResolved + 1,
  };
}

export function recordAnswer(
  state: SaveState, questionId: string, correct: boolean,
): SaveState {
  const prev = state.questionStats[questionId] ?? { correct: 0, wrong: 0 };
  return {
    ...state,
    questionStats: {
      ...state.questionStats,
      [questionId]: {
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
      },
    },
  };
}
