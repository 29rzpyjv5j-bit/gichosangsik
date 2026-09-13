import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import { stageKey, TIERS } from '../types';
import App from '../App';

vi.mock('../data/questions', () => {
  const questions = Array.from({ length: 5 }, (_, i) => ({
    id: `sc-b-0${i + 1}`,
    category: 'science',
    tier: 'basic',
    stage: 1,
    type: 'choice',
    prompt: `문제 ${i + 1}`,
    choices: ['가', '나', '다', '라'],
    answerIndex: 1,
    hint: '힌트',
    explanation: '해설',
    writtenAt: '2026-09',
  }));
  return {
    ALL_QUESTIONS: questions,
    BANK: { science: questions },
    REGISTERED_CATEGORIES: ['science'],
    QUESTION_BY_ID: Object.fromEntries(questions.map((q) => [q.id, q])),
    questionsOfStage: () => questions,
  };
});

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('레벨 칭호와 상금, 지갑이 보인다', () => {
  saveSave(makeSave({ totalPrize: 1_024_000, wallet: 28_000 }));
  renderApp();
  expect(screen.getByText(/Lv\.6/)).toBeInTheDocument();
  expect(screen.getByText(/마을 백과사전/)).toBeInTheDocument();
  expect(screen.getByText('1,024,000원')).toBeInTheDocument();
  expect(screen.getByText('28,000원')).toBeInTheDocument();
});

test('오늘 보너스를 안 받았으면 볼게임 시작 버튼이 보인다', () => {
  saveSave(makeSave());
  renderApp();
  expect(screen.getByRole('button', { name: /오늘의 볼게임 시작/ })).toBeEnabled();
});

test('오늘 보너스를 이미 받았으면 한 판 더로 바뀐다', () => {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  saveSave(makeSave({ dailyGame: { lastBonusDate: iso, completed: 1 } }));
  renderApp();
  expect(screen.getByRole('button', { name: /한 판 더/ })).toBeInTheDocument();
});

test('오답노트와 뱃지 개수가 보인다', () => {
  saveSave(makeSave({
    wrongNotes: ['sc-b-01', 'sc-b-02'],
    badges: [{ id: 'perfect-1', earnedAt: '2026-09-13' }],
  }));
  renderApp();
  expect(screen.getByText(/오답노트/)).toHaveTextContent('2문제');
  expect(screen.getByText(/뱃지/)).toHaveTextContent('1개');
});

test('기록이 없으면 이어서 하기가 첫 카테고리를 가리킨다', () => {
  saveSave(makeSave());
  renderApp();
  expect(screen.getByText(/한국사부터 시작하기/)).toBeInTheDocument();
});

test('마지막 플레이 카테고리를 다 깼으면 다음 카테고리로 표시한다', () => {
  const stages: Record<string, { cleared: boolean; bestCorrect: number; plays: number }> = {};
  // Mark all korean-history stages as cleared
  for (const tier of TIERS) {
    for (const stage of [1, 2, 3] as const) {
      stages[stageKey('korean-history', tier, stage)] = { cleared: true, bestCorrect: 3, plays: 1 };
    }
  }
  saveSave(makeSave({
    stages,
    lastPlayed: { category: 'korean-history', tier: 'basic', stage: 1 },
  }));
  renderApp();
  // Should show world-history (next category), not "이어서 하기"
  expect(screen.getByText(/세계사부터 시작하기/)).toBeInTheDocument();
  expect(screen.queryByText(/이어서 하기/)).not.toBeInTheDocument();
});

test('카테고리 칩을 누르면 카테고리 화면으로 간다', async () => {
  saveSave(makeSave());
  renderApp();
  await userEvent.click(screen.getByRole('button', { name: /과학/ }));
  expect(screen.getByRole('button', { name: '입문' })).toBeInTheDocument();
});
