import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameProvider, useGame } from './GameProvider';
import { saveSave, STORAGE_KEY } from '../storage/save';
import { makeSave } from '../test/factories';

function Probe() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <span data-testid="wallet">{state.save.wallet}</span>
      <button type="button" onClick={() => dispatch({ type: 'BUY_THEME', theme: 'apricot' })}>
        살구빛 구매
      </button>
      <button type="button" onClick={() => dispatch({ type: 'SET_THEME', theme: 'apricot' })}>
        살구빛 적용
      </button>
      <button type="button" onClick={() => dispatch({ type: 'SET_THEME', theme: 'default' })}>
        기본 테마
      </button>
    </div>
  );
}

test('저장된 상태를 불러온다', () => {
  saveSave(makeSave({ wallet: 400_000 }));
  render(<GameProvider><Probe /></GameProvider>);
  expect(screen.getByTestId('wallet')).toHaveTextContent('400000');
});

test('상태가 바뀌면 localStorage에 저장된다', async () => {
  saveSave(makeSave({ wallet: 400_000 }));
  render(<GameProvider><Probe /></GameProvider>);
  await userEvent.click(screen.getByText('살구빛 구매'));

  expect(screen.getByTestId('wallet')).toHaveTextContent('100000');
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(stored.wallet).toBe(100_000);
  expect(stored.owned.themes).toContain('apricot');
});

test('Provider 밖에서 useGame을 쓰면 에러를 던진다', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow();
  spy.mockRestore();
});
