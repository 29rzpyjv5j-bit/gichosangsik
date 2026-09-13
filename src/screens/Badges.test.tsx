import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import App from '../App';

vi.mock('../data/questions', () => ({
  ALL_QUESTIONS: [], BANK: {}, REGISTERED_CATEGORIES: [],
  QUESTION_BY_ID: {}, questionsOfStage: () => [],
}));

function renderBadges() {
  render(
    <MemoryRouter initialEntries={['/badges']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
}

test('뱃지 18개가 모두 보인다', () => {
  saveSave(makeSave());
  renderBadges();
  expect(screen.getByText('한국사 마스터')).toBeInTheDocument();
  expect(screen.getByText('첫 만점')).toBeInTheDocument();
  expect(screen.getByText('척척박사')).toBeInTheDocument();
  expect(screen.getByText(/0 \/ 18/)).toBeInTheDocument();
});

test('미획득 뱃지에 진행률이 붙는다', () => {
  saveSave(makeSave({
    perfectCount: 3,
    dailyGame: { lastBonusDate: null, completed: 9 },
    wrongNotesEverAdded: 2,
    wrongNotes: ['a', 'b'],
  }));
  renderBadges();
  expect(screen.getByText('3/10')).toBeInTheDocument();
  expect(screen.getByText('9/30')).toBeInTheDocument();
  expect(screen.getByText('남은 오답 2개')).toBeInTheDocument();
  // 카테고리 마스터 7개가 모두 같은 문구를 쓴다
  expect(screen.getAllByText('클리어 0/9')).toHaveLength(7);
});

test('획득한 뱃지는 획득일을 보여준다', () => {
  saveSave(makeSave({
    perfectCount: 1,
    badges: [{ id: 'perfect-1', earnedAt: '2026-09-13' }],
  }));
  renderBadges();
  expect(screen.getByText('2026-09-13')).toBeInTheDocument();
  expect(screen.getByText(/1 \/ 18/)).toBeInTheDocument();
});
