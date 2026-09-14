import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from './state/GameProvider';
import App from './App';

vi.mock('./data/questions', () => ({
  ALL_QUESTIONS: [],
  BANK: {},
  REGISTERED_CATEGORIES: [],
  QUESTION_BY_ID: {},
  questionsOfStage: () => [],
}));

test('홈 화면이 그려진다', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: '어느 섬으로 떠날까요?' })).toBeInTheDocument();
});
