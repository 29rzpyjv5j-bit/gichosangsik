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

async function enterQuiz(wallet = 0) {
  saveSave(makeSave({ wallet }));
  render(
    <MemoryRouter initialEntries={['/category/science']}>
      <GameProvider><App /></GameProvider>
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole('button', { name: /우리 몸/ }));
}

test('첫 문제와 보기 4개, 진행도가 보인다', async () => {
  await enterQuiz();
  expect(screen.getByText('문제 1')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '가' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '라' })).toBeInTheDocument();
  expect(screen.getByText('1/5')).toBeInTheDocument();
});

test('정답을 고르면 해설이 뜨고 계속 버튼이 나온다', async () => {
  await enterQuiz();
  await userEvent.click(screen.getByRole('button', { name: '나' }));
  expect(screen.getByText('해설 1')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '계속' })).toBeInTheDocument();
});

test('계속을 누르면 다음 문제로 간다', async () => {
  await enterQuiz();
  await userEvent.click(screen.getByRole('button', { name: '나' }));
  await userEvent.click(screen.getByRole('button', { name: '계속' }));
  expect(screen.getByText('문제 2')).toBeInTheDocument();
  expect(screen.getByText('2/5')).toBeInTheDocument();
});

test('힌트를 사면 힌트가 열리고 지갑이 줄어든다', async () => {
  await enterQuiz(100_000);
  await userEvent.click(screen.getByRole('button', { name: /힌트/ }));
  expect(screen.getByText('힌트 1')).toBeInTheDocument();
  expect(screen.getByText(/70,000원/)).toBeInTheDocument();
});

test('잔액이 부족하면 아이템 버튼이 비활성이다', async () => {
  await enterQuiz(1_000);
  expect(screen.getByRole('button', { name: /힌트/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: /반반/ })).toBeDisabled();
});

test('반반 찬스를 쓰면 보기 2개가 비활성이 된다', async () => {
  await enterQuiz(100_000);
  await userEvent.click(screen.getByRole('button', { name: /반반/ }));
  const disabled = ['가', '나', '다', '라']
    .map((label) => screen.getByRole('button', { name: label }))
    .filter((el) => (el as HTMLButtonElement).disabled);
  expect(disabled).toHaveLength(2);
  expect(screen.getByRole('button', { name: '나' })).toBeEnabled();
});

test('패스를 쓰면 정답이 공개되고 넘어갈 수 있다', async () => {
  await enterQuiz(100_000);
  await userEvent.click(screen.getByRole('button', { name: /패스/ }));
  expect(screen.getByText('해설 1')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '계속' }));
  expect(screen.getByText('문제 2')).toBeInTheDocument();
});

test('아이템을 쓰고 나가려면 확인을 받는다', async () => {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
  await enterQuiz(100_000);
  await userEvent.click(screen.getByRole('button', { name: /힌트/ }));
  await userEvent.click(screen.getByRole('button', { name: '나가기' }));
  expect(confirmSpy).toHaveBeenCalled();
  expect(screen.getByText('문제 1')).toBeInTheDocument();
  confirmSpy.mockRestore();
});

test('5문제를 다 풀면 결과 화면으로 간다', async () => {
  await enterQuiz();
  for (let i = 0; i < 5; i++) {
    await userEvent.click(screen.getByRole('button', { name: '나' }));
    await userEvent.click(screen.getByRole('button', { name: '계속' }));
  }
  expect(screen.getByText(/스테이지 클리어/)).toBeInTheDocument();
});
