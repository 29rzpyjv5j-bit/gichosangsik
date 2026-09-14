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

function renderShop(path = '/shop') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('가구를 사면 방에 놓이고, 다시 누르면 치운다', async () => {
  saveSave(makeSave({ wallet: 100_000 }));
  renderShop();
  await userEvent.click(screen.getByRole('button', { name: /동글 화분 20,000원/ }));
  expect(screen.getByText('80,000원')).toBeInTheDocument();
  expect(screen.getByLabelText('동글 화분')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /동글 화분 사용 중/ }));
  expect(screen.getByRole('button', { name: /동글 화분 보유/ })).toBeInTheDocument();
});

test('레벨이 모자란 가구는 잠겨 있다', () => {
  saveSave(makeSave({ wallet: 1_000_000 }));
  renderShop();
  expect(screen.getByRole('button', { name: /Lv\.12/ })).toBeDisabled();
});

test('잔액이 부족하면 살 수 없다', () => {
  saveSave(makeSave({ wallet: 10_000 }));
  renderShop();
  expect(screen.getByRole('button', { name: /동글 화분 20,000원/ })).toBeDisabled();
});

test('펭귄 꾸미기 탭에서 옷을 사고 입는다', async () => {
  saveSave(makeSave({ wallet: 100_000 }));
  renderShop('/shop?tab=outfit');
  const beret = screen.getAllByRole('button').find((b) => /30,000원/.test(b.getAttribute('aria-label') ?? ''))!;
  await userEvent.click(beret);
  expect(screen.getByText('70,000원')).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /사용 중/ })).toHaveLength(1);
});

test('벽지를 사고 적용한다', async () => {
  saveSave(makeSave({ wallet: 400_000 }));
  renderShop('/shop?tab=wallpaper');
  await userEvent.click(screen.getByRole('button', { name: /살구빛 300,000원/ }));
  expect(screen.getByText('100,000원')).toBeInTheDocument();
  const apricot = screen.queryByRole('button', { name: /살구빛 보유/ });
  if (apricot) await userEvent.click(apricot);
  expect(screen.getByRole('button', { name: /살구빛 사용 중/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /라벤더 500,000원/ })).toBeDisabled();
});
