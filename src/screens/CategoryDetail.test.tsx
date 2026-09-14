import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import { stageKey } from '../types';
import App from '../App';

const questionBankState = vi.hoisted(() => ({ empty: false }));

vi.mock('../data/questions', () => {
  const make = (i: number) => ({
    id: `sc-b-0${i}`,
    category: 'science',
    tier: 'basic',
    stage: 1,
    type: 'choice',
    prompt: `문제 ${i}`,
    choices: ['가', '나', '다', '라'],
    answerIndex: 1,
    hint: '힌트',
    explanation: '해설',
    writtenAt: '2026-09',
  });
  const questions = [1, 2, 3, 4, 5].map(make);
  return {
    ALL_QUESTIONS: questions,
    BANK: { science: questions },
    REGISTERED_CATEGORIES: ['science'],
    QUESTION_BY_ID: Object.fromEntries(questions.map((q) => [q.id, q])),
    questionsOfStage: () => (questionBankState.empty ? [] : questions),
  };
});

afterEach(() => {
  questionBankState.empty = false;
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('9단계 노드가 모두 보인다', () => {
  saveSave(makeSave());
  renderAt('/category/science');
  expect(screen.getByRole('button', { name: '1단계 우리 몸' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^4단계 물질과 화학/ })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /^\d단계 / })).toHaveLength(9);
});

test('처음에는 1단계만 도전할 수 있다', async () => {
  saveSave(makeSave());
  renderAt('/category/science');
  expect(screen.getByText('5문제 · 도전 가능')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '도전' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: /^2단계/ }));
  expect(screen.getByText('앞 스테이지를 깨면 열립니다')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '도전' })).toBeDisabled();
});

test('잠긴 단계를 누르면 해금 조건을 알려준다', async () => {
  saveSave(makeSave());
  renderAt('/category/science');
  await userEvent.click(screen.getByRole('button', { name: /^4단계/ }));
  expect(screen.getByText('입문 3스테이지를 모두 깨면 열립니다')).toBeInTheDocument();
});

test('문제가 하나도 없어도 잠긴 단계는 해금 조건을 알려준다', async () => {
  questionBankState.empty = true;
  saveSave(makeSave());
  renderAt('/category/science');
  expect(screen.getByText('문제 준비 중')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /^4단계/ }));
  expect(screen.getByText('입문 3스테이지를 모두 깨면 열립니다')).toBeInTheDocument();
});

test('클리어한 단계는 최고 기록과 다시 도전을 보여준다', async () => {
  saveSave(makeSave({
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 4, plays: 2 } },
  }));
  renderAt('/category/science');
  await userEvent.click(screen.getByRole('button', { name: /^1단계/ }));
  expect(screen.getByText(/최고 4\/5/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '다시 도전' })).toBeEnabled();
});

test('카테고리 목록에 7개와 진행률이 보인다', () => {
  saveSave(makeSave({
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 1 } },
  }));
  renderAt('/categories');
  expect(screen.getByText('한국사')).toBeInTheDocument();
  expect(screen.getByText('시사')).toBeInTheDocument();
  expect(screen.getByText('1/9')).toBeInTheDocument();
});

test('도전을 누르면 퀴즈 화면으로 간다', async () => {
  saveSave(makeSave());
  renderAt('/category/science');
  await userEvent.click(screen.getByRole('button', { name: '도전' }));
  expect(screen.getByText('문제 1')).toBeInTheDocument();
});
