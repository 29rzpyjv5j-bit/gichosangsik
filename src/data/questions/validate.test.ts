import { validateQuestions } from './validate';
import { makeQuestion } from '../../test/factories';
import type { Question, StageNo, Tier } from '../../types';

function fullBank(): Question[] {
  const out: Question[] = [];
  const tiers: [Tier, string][] = [['basic', 'b'], ['mid', 'm'], ['advanced', 'a']];
  for (const [tier, short] of tiers) {
    for (let i = 1; i <= 15; i++) {
      const stage = (Math.ceil(i / 5) as StageNo);
      out.push(makeQuestion({
        id: `sc-${short}-${String(i).padStart(2, '0')}`,
        category: 'science',
        tier,
        stage,
      }));
    }
  }
  return out;
}

test('올바른 45문제 묶음은 문제가 없다', () => {
  expect(validateQuestions(fullBank(), 'science')).toEqual([]);
});

test('문제 수가 모자라면 잡아낸다', () => {
  const bank = fullBank().slice(0, 44);
  const errors = validateQuestions(bank, 'science');
  expect(errors.join(' ')).toContain('science-advanced-3');
});

test('id 중복을 잡아낸다', () => {
  const bank = fullBank();
  bank[1] = { ...bank[1], id: bank[0].id };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('id 중복');
});

test('보기 개수가 틀리면 잡아낸다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], choices: ['가', '나', '다'] };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('보기 4개');
});

test('OX 문제의 보기는 O와 X여야 한다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], type: 'ox', choices: ['예', '아니오'], answerIndex: 0 };
  expect(validateQuestions(bank, 'science').join(' ')).toContain("['O','X']");
});

test('정답 번호가 범위를 벗어나면 잡아낸다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], answerIndex: 4 };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('정답 번호');
});

test('보기 중복을 잡아낸다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], choices: ['같다', '같다', '다르다', '모른다'] };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('보기 중복');
});

test('빈 문항·힌트·해설을 잡아낸다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], hint: '  ' };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('힌트');
});

test('힌트에 정답이 그대로 들어 있으면 잡아낸다', () => {
  const bank = fullBank();
  bank[0] = {
    ...bank[0],
    choices: ['50도', '80도', '100도', '120도'],
    answerIndex: 2,
    hint: '정답은 100도예요.',
  };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('정답 누설');
});

test('카테고리가 파일과 다르면 잡아낸다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], category: 'math' };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('카테고리 불일치');
});

test('집필 시점 형식을 검사한다', () => {
  const bank = fullBank();
  bank[0] = { ...bank[0], writtenAt: '2026년 9월' };
  expect(validateQuestions(bank, 'science').join(' ')).toContain('writtenAt');
});
