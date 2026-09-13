import {
  createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode,
} from 'react';
import { loadSave, saveSave } from '../storage/save';
import { gameReducer, initialAppState, type Action, type AppState } from './gameReducer';

const GameContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(() => loadSave());
  const [state, dispatch] = useReducer(
    gameReducer,
    initialAppState(boot.state, boot.warning),
  );

  useEffect(() => {
    saveSave(state.save);
  }, [state.save]);

  useEffect(() => {
    const theme = state.save.settings.theme;
    if (theme === 'default') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [state.save.settings.theme]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
  );
}

export function useGame(): { state: AppState; dispatch: Dispatch<Action> } {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame은 GameProvider 안에서만 쓸 수 있습니다');
  return value;
}
