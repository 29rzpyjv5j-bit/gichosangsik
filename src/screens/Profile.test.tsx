import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import { stageKey } from '../types';
import App from '../App';

vi.mock('../data/questions', () => ({
  ALL_QUESTIONS: [], BANK: {}, REGISTERED_CATEGORIES: [],
  QUESTION_BY_ID: {}, questionsOfStage: () => [],
}));

function renderProfile() {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('레벨·상금·통계가 보인다', () => {
  saveSave(makeSave({
    totalPrize: 1_024_000,
    wallet: 28_000,
    perfectCount: 4,
    dailyGame: { lastBonusDate: null, completed: 9 },
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 3 } },
    questionStats: {
      'sc-b-01': { correct: 2, wrong: 0 },
      'sc-b-02': { correct: 0, wrong: 2 },
    },
  }));
  renderProfile();
  expect(screen.getByText(/마을 백과사전/)).toBeInTheDocument();
  expect(screen.getByText('1,024,000원')).toBeInTheDocument();
  expect(screen.getByText(/만점 4회/)).toBeInTheDocument();
  expect(screen.getByText(/섞어 풀기 9회/)).toBeInTheDocument();
  expect(screen.getByText(/총 3판/)).toBeInTheDocument();
});

test('방과 성장 단계가 보이고 상점으로 갈 수 있다', async () => {
  saveSave(makeSave({ owned: { themes: ['default'], avatars: ['smile'], furniture: ['plant'], outfits: [] }, settings: { ...makeSave().settings, room: { left: 'plant' } } }));
  renderProfile();
  expect(screen.getByLabelText('동글 화분')).toBeInTheDocument();
  expect(screen.getAllByText('???').length).toBeGreaterThan(0);
  await userEvent.click(screen.getByRole('button', { name: /방 꾸미기/ }));
  expect(screen.getByRole('tab', { name: '가구', selected: true })).toBeInTheDocument();
});

test('초기화는 두 번 눌러야 실행된다', async () => {
  saveSave(makeSave({ totalPrize: 500_000, wallet: 500_000 }));
  renderProfile();
  await userEvent.click(screen.getByRole('button', { name: '전체 초기화' }));
  // 누적과 지갑 두 곳에 나온다
  expect(screen.getAllByText('500,000원')).toHaveLength(2);
  await userEvent.click(screen.getByRole('button', { name: /정말 지울게요/ }));
  expect(screen.getAllByText('0원')).toHaveLength(2);
});
