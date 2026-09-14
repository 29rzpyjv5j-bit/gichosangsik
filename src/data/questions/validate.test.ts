import { validateQuestions } from './validate';
import { makeQuestion } from '../../test/factories';
import type { Question, StageNo, Tier } from '../../types';

// 정답 문자열 '100도'를 k번째 자리에 두고 나머지 보기를 순서대로 채운다.
// 정답 위치만 옮기고 정답 자체는 그대로 유지하기 위한 도우미.
function answerAt(k: number): Pick<Question, 'choices' | 'answerIndex'> {
  const others = ['50도', '80도', '120도'];
  const choices = [...others];
  choices.splice(k, 0, '100도');
  return { choices, answerIndex: k };
}

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
        // 정답 위치를 0→1→2→3 순으로 돌려 한쪽으로 쏠리지 않게 한다.
        ...answerAt(out.length % 4),
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
  const withEmptyPrompt = fullBank();
  withEmptyPrompt[0] = { ...withEmptyPrompt[0], prompt: '  ' };
  expect(validateQuestions(withEmptyPrompt, 'science').join(' ')).toContain('문항');

  const withEmptyHint = fullBank();
  withEmptyHint[0] = { ...withEmptyHint[0], hint: '  ' };
  expect(validateQuestions(withEmptyHint, 'science').join(' ')).toContain('힌트');

  const withEmptyExplanation = fullBank();
  withEmptyExplanation[0] = { ...withEmptyExplanation[0], explanation: '  ' };
  expect(validateQuestions(withEmptyExplanation, 'science').join(' ')).toContain('해설');
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

function oxBank(hint: string, answerIndex: 0 | 1 = 0): Question[] {
  const bank = fullBank();
  bank[0] = {
    ...bank[0],
    type: 'ox',
    choices: ['O', 'X'],
    answerIndex,
    hint,
  };
  return bank;
}

test('OX 힌트가 "정답은 O예요"처럼 정답을 말하면 잡아낸다', () => {
  const errors = validateQuestions(oxBank('정답은 O예요', 0), 'science').join(' ');
  expect(errors).toContain('정답 누설');
});

test('OX 힌트가 "답: O"처럼 정답을 말하면 잡아낸다', () => {
  const errors = validateQuestions(oxBank('답: O', 0), 'science').join(' ');
  expect(errors).toContain('정답 누설');
});

test('OX 힌트가 "정답 O"처럼 정답을 말하면 잡아낸다', () => {
  const errors = validateQuestions(oxBank('정답 O', 0), 'science').join(' ');
  expect(errors).toContain('정답 누설');
});

test('OX 힌트가 "답은 O입니다"처럼 정답을 말하면 잡아낸다', () => {
  const errors = validateQuestions(oxBank('답은 O입니다', 0), 'science').join(' ');
  expect(errors).toContain('정답 누설');
});

test('OX 힌트에 "OECD"처럼 O가 단어 속에 있으면 잡지 않는다', () => {
  const errors = validateQuestions(oxBank('OECD가 어떤 기구인지 떠올려 보세요', 0), 'science');
  expect(errors.join(' ')).not.toContain('정답 누설');
});

test('OX 힌트에 "X선"처럼 X가 단어 속에 있으면 잡지 않는다', () => {
  // 정답은 X (answerIndex 1) 인 문제라도 'X선'은 정답을 말하는 어법이 아니다.
  const errors = validateQuestions(oxBank('X선 사진을 생각해보세요', 1), 'science');
  expect(errors.join(' ')).not.toContain('정답 누설');
});

test('OX 힌트가 오답을 말하면 잡지 않는다', () => {
  // 정답은 O(answerIndex 0)인데 힌트는 "정답은 X"라고 틀린 글자를 말함 - 누설이 아님
  const errors = validateQuestions(oxBank('정답은 X입니다', 0), 'science');
  expect(errors.join(' ')).not.toContain('정답 누설');
});

test('OX 힌트에 "답"이라는 단어만 있고 정답 글자가 없으면 잡지 않는다', () => {
  const errors = validateQuestions(oxBank('이 답은 생각보다 단순해요', 0), 'science');
  expect(errors.join(' ')).not.toContain('정답 누설');
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

test('4지선다 정답이 모두 첫 번째 보기에 몰려 있으면 잡아낸다', () => {
  const bank = fullBank().map((q) => ({ ...q, ...answerAt(0) }));
  const errors = validateQuestions(bank, 'science').join(' ');
  expect(errors).toContain('science 정답 위치 1번');
  expect(errors).toContain('45개');
  expect(errors).toContain('허용 7~15개');
  // 비어 있는 자리도 너무 적다고 각각 잡아낸다.
  expect(errors).toContain('science 정답 위치 4번');
});

test('정답 위치가 고르게 퍼져 있으면 쏠림으로 잡지 않는다', () => {
  const bank = fullBank();
  const counts = [0, 0, 0, 0];
  for (const q of bank) counts[q.answerIndex]++;
  expect(counts).toEqual([12, 11, 11, 11]);
  expect(validateQuestions(bank, 'science').join(' ')).not.toContain('정답 위치');
});

test('정답 위치 쏠림은 OX 문제를 세지 않는다', () => {
  // 앞 36문제는 4지선다로 위치별 9개씩, 뒤 9문제는 OX 정답 O(0번).
  // OX까지 세면 0번 자리가 18/45 = 40%라 걸리지만, 4지선다만 세면 고르다.
  const bank = fullBank().map((q, i) =>
    i < 36 ? q : { ...q, type: 'ox' as const, choices: ['O', 'X'], answerIndex: 0 },
  );
  expect(validateQuestions(bank, 'science').join(' ')).not.toContain('정답 위치');
});
