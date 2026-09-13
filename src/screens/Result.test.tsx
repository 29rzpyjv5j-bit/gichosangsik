import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { saveSave } from '../storage/save';
import { makeSave } from '../test/factories';
import App from '../App';

vi.mock('../data/questions', () => {
  const questions = [1, 2, 3, 4, 5].map((i) => ({
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

async function playPerfect(save = makeSave()) {
  saveSave(save);
  render(
    <MemoryRouter initialEntries={['/category/science']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole('button', { name: /우리 몸/ }));
  for (let i = 0; i < 5; i++) {
    await userEvent.click(screen.getByRole('button', { name: '나' }));
    await userEvent.click(screen.getByRole('button', { name: '계속' }));
  }
}

test('만점 결과에 상금 내역과 합계가 보인다', async () => {
  await playPerfect();
  expect(screen.getByText(/스테이지 클리어/)).toBeInTheDocument();
  expect(screen.getByText('정답 5개 (입문 1배)')).toBeInTheDocument();
  expect(screen.getByText('첫 클리어 보너스')).toBeInTheDocument();
  expect(screen.getByText('만점 보너스')).toBeInTheDocument();
  expect(screen.getByText('100,000원')).toBeInTheDocument();
});

test('아이템 사용 비용은 결과에 표시하지 않는다', async () => {
  saveSave(makeSave({ wallet: 100_000 }));
  render(
    <MemoryRouter initialEntries={['/category/science']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole('button', { name: /우리 몸/ }));
  await userEvent.click(screen.getByRole('button', { name: /힌트/ }));
  for (let i = 0; i < 5; i++) {
    await userEvent.click(screen.getByRole('button', { name: '나' }));
    await userEvent.click(screen.getByRole('button', { name: '계속' }));
  }
  expect(screen.queryByText(/아이템/)).toBeNull();
});

test('새 뱃지가 결과에 보인다', async () => {
  await playPerfect();
  expect(screen.getByText(/첫 만점/)).toBeInTheDocument();
});

test('레벨업이 있으면 오버레이가 먼저 뜨고 닫을 수 있다', async () => {
  await playPerfect(makeSave({ totalPrize: 90_000 }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/아는 척 초보/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '좋아요' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('나가기를 누르면 홈으로 간다', async () => {
  await playPerfect();
  await userEvent.click(screen.getByRole('button', { name: '나가기' }));
  expect(screen.getByRole('button', { name: /오늘의 볼게임 시작|한 판 더/ })).toBeInTheDocument();
});

test('결과 없이 직접 들어오면 홈으로 돌려보낸다', () => {
  saveSave(makeSave());
  render(
    <MemoryRouter initialEntries={['/result']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole('button', { name: /오늘의 볼게임 시작|한 판 더|문제 준비 중/ }))
    .toBeInTheDocument();
});
