import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import App from '../App';

vi.mock('../data/questions', () => {
  const questions = [1, 2, 3].map((i) => ({
    id: `sc-b-0${i}`,
    category: 'science',
    tier: 'basic',
    stage: 1,
    type: 'choice',
    prompt: `문제 ${i}`,
    choices: ['가', '나', '다', '라'],
    answerIndex: 1,
    hint: `힌트 ${i}`,
    explanation: `해설 ${i}`,
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

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('오답이 없으면 빈 상태를 보여준다', () => {
  saveSave(makeSave());
  renderAt('/wrong-notes');
  expect(screen.getByText(/틀린 문제가 없어요/)).toBeInTheDocument();
});

test('오답을 카테고리별로 나열한다', () => {
  saveSave(makeSave({ wrongNotes: ['sc-b-01', 'sc-b-02'] }));
  renderAt('/wrong-notes');
  expect(screen.getByText(/과학/)).toBeInTheDocument();
  expect(screen.getByText('문제 1')).toBeInTheDocument();
  expect(screen.getByText('문제 2')).toBeInTheDocument();
});

test('복습을 시작하면 퀴즈 화면으로 간다', async () => {
  saveSave(makeSave({ wrongNotes: ['sc-b-01'] }));
  renderAt('/wrong-notes');
  await userEvent.click(screen.getByRole('button', { name: /복습 시작/ }));
  expect(screen.getByText('오답노트 복습')).toBeInTheDocument();
});

test('복습에서 맞히면 오답노트에서 빠진다', async () => {
  saveSave(makeSave({ wrongNotes: ['sc-b-01'], wrongNotesEverAdded: 1 }));
  renderAt('/wrong-notes');
  await userEvent.click(screen.getByRole('button', { name: /복습 시작/ }));
  await userEvent.click(screen.getByRole('button', { name: '나' }));
  await userEvent.click(screen.getByRole('button', { name: '계속' }));
  expect(screen.getByText('복습 끝!')).toBeInTheDocument();
  expect(screen.getByText('오답 정답 1개')).toBeInTheDocument();
});
