import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import App from '../App';

vi.mock('../data/questions', () => ({
  ALL_QUESTIONS: [], BANK: {}, REGISTERED_CATEGORIES: [],
  QUESTION_BY_ID: {}, questionsOfStage: () => [],
}));

function renderShop() {
  render(
    <MemoryRouter initialEntries={['/shop']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('소모 아이템 가격과 안내가 보인다', () => {
  saveSave(makeSave());
  renderShop();
  expect(screen.getByText(/반반 찬스/)).toBeInTheDocument();
  expect(screen.getByText('20,000원')).toBeInTheDocument();
  expect(screen.getByText(/퀴즈 화면에서/)).toBeInTheDocument();
});

test('잔액이 부족한 테마는 살 수 없다', () => {
  saveSave(makeSave({ wallet: 100_000 }));
  renderShop();
  expect(screen.getByRole('button', { name: /살구빛/ })).toBeDisabled();
});

test('테마를 사면 보유로 바뀐다', async () => {
  saveSave(makeSave({ wallet: 400_000 }));
  renderShop();
  await userEvent.click(screen.getByRole('button', { name: /살구빛/ }));
  expect(screen.getByText(/살구빛/).closest('div')).toHaveTextContent('보유');
  expect(screen.getByText('100,000원')).toBeInTheDocument();
});

test('아바타를 사면 보유로 바뀐다', async () => {
  saveSave(makeSave({ wallet: 300_000 }));
  renderShop();
  await userEvent.click(screen.getByRole('button', { name: /🦊/ }));
  expect(screen.getByText('100,000원')).toBeInTheDocument();
});
