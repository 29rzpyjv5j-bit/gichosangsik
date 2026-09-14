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

test('레벨, 성장 단계, 지갑이 보인다', () => {
  saveSave(makeSave({ totalPrize: 1_024_000, wallet: 28_000 }));
  renderApp();
  expect(screen.getByText(/Lv\.6/)).toBeInTheDocument();
  expect(screen.getByText(/마을 백과사전/)).toBeInTheDocument();
  expect(screen.getByText('28,000원')).toBeInTheDocument();
});

test('홈에는 섞어 풀기가 없다', () => {
  saveSave(makeSave());
  renderApp();
  expect(screen.queryByRole('button', { name: /섞어 풀기/ })).not.toBeInTheDocument();
});

test('기록이 없으면 첫 섬을 가리킨다', () => {
  saveSave(makeSave());
  renderApp();
  expect(screen.getByText(/한국사 섬부터 시작해요/)).toBeInTheDocument();
});

test('마지막으로 플레이한 섬은 다음 단계를 가리킨다', () => {
  saveSave(makeSave({
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 1 } },
    lastPlayed: { category: 'science', tier: 'basic', stage: 1 },
  }));
  renderApp();
  expect(screen.getByText(/과학 섬 2단계부터!/)).toBeInTheDocument();
});

test('마지막 섬을 다 깼으면 다음 섬으로 넘어간다', () => {
  const stages: Record<string, { cleared: boolean; bestCorrect: number; plays: number }> = {};
  for (const tier of TIERS) {
    for (const stage of [1, 2, 3] as const) {
      stages[stageKey('korean-history', tier, stage)] = { cleared: true, bestCorrect: 3, plays: 1 };
    }
  }
  saveSave(makeSave({ stages, lastPlayed: { category: 'korean-history', tier: 'basic', stage: 1 } }));
  renderApp();
  expect(screen.getByText(/세계사 섬부터 시작해요/)).toBeInTheDocument();
});

test('섬을 누르면 그 섬의 단계 지도로 간다', async () => {
  saveSave(makeSave());
  renderApp();
  await userEvent.click(screen.getByRole('button', { name: /^과학/ }));
  expect(screen.getByRole('heading', { name: '과학 섬' })).toBeInTheDocument();
});
