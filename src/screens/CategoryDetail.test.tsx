import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import { stageKey } from '../types';
import App from '../App';

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
    questionsOfStage: () => questions,
  };
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('단계 탭과 스테이지 3개가 보인다', () => {
  saveSave(makeSave());
  renderAt('/category/science');
  expect(screen.getByRole('button', { name: '입문' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '중급' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '상급' })).toBeInTheDocument();
  expect(screen.getByText('우리 몸')).toBeInTheDocument();
  expect(screen.getByText('동물과 식물')).toBeInTheDocument();
  expect(screen.getByText('날씨와 지구')).toBeInTheDocument();
});

test('처음에는 1스테이지만 도전할 수 있다', () => {
  saveSave(makeSave());
  renderAt('/category/science');
  expect(screen.getByRole('button', { name: /우리 몸/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /동물과 식물/ })).toBeDisabled();
});

test('잠긴 단계를 누르면 해금 조건을 알려준다', async () => {
  saveSave(makeSave());
  renderAt('/category/science');
  await userEvent.click(screen.getByRole('button', { name: '중급' }));
  expect(screen.getByText('입문 3스테이지를 모두 깨면 열립니다')).toBeInTheDocument();
});

test('클리어한 스테이지는 최고 기록을 보여준다', () => {
  saveSave(makeSave({
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 4, plays: 2 } },
  }));
  renderAt('/category/science');
  expect(screen.getByText(/최고 4\/5/)).toBeInTheDocument();
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
