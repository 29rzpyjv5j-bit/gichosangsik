import { addWrongNote, resolveWrongNote, recordAnswer } from './wrongNotes';
import { makeSave } from '../test/factories';

test('틀린 문제가 오답노트에 등록된다', () => {
  const s = addWrongNote(makeSave(), 'kh-b-03');
  expect(s.wrongNotes).toEqual(['kh-b-03']);
  expect(s.wrongNotesEverAdded).toBe(1);
});

test('같은 문제를 두 번 등록해도 하나만 남는다', () => {
  let s = addWrongNote(makeSave(), 'kh-b-03');
  s = addWrongNote(s, 'kh-b-03');
  expect(s.wrongNotes).toEqual(['kh-b-03']);
  expect(s.wrongNotesEverAdded).toBe(1);
});

test('원래 상태를 바꾸지 않는다', () => {
  const before = makeSave();
  addWrongNote(before, 'kh-b-03');
  expect(before.wrongNotes).toEqual([]);
});

test('맞히면 오답노트에서 빠지고 해결 횟수가 오른다', () => {
  let s = addWrongNote(makeSave(), 'kh-b-03');
  s = addWrongNote(s, 'sc-m-07');
  s = resolveWrongNote(s, 'kh-b-03');
  expect(s.wrongNotes).toEqual(['sc-m-07']);
  expect(s.wrongNotesResolved).toBe(1);
});

test('오답노트에 없는 문제를 제거해도 해결 횟수가 오르지 않는다', () => {
  const s = resolveWrongNote(makeSave(), 'kh-b-03');
  expect(s.wrongNotesResolved).toBe(0);
});

test('문제별 정답·오답 횟수를 기록한다', () => {
  let s = recordAnswer(makeSave(), 'kh-b-01', true);
  s = recordAnswer(s, 'kh-b-01', false);
  s = recordAnswer(s, 'kh-b-01', true);
  expect(s.questionStats['kh-b-01']).toEqual({ correct: 2, wrong: 1 });
});

test('resolveWrongNote는 원래 상태의 wrongNotes를 바꾸지 않는다', () => {
  const before = makeSave({ wrongNotes: ['kh-b-03', 'sc-m-07'] });
  resolveWrongNote(before, 'kh-b-03');
  expect(before.wrongNotes).toEqual(['kh-b-03', 'sc-m-07']);
  expect(before.wrongNotes.length).toBe(2);
});

test('recordAnswer는 원래 상태의 questionStats를 바꾸지 않는다', () => {
  const before = makeSave({
    questionStats: { 'kh-b-01': { correct: 1, wrong: 0 } },
  });
  const originalStats = before.questionStats['kh-b-01'];
  recordAnswer(before, 'kh-b-01', true);
  expect(before.questionStats['kh-b-01']).toEqual({ correct: 1, wrong: 0 });
  expect(before.questionStats['kh-b-01']).toBe(originalStats);
  expect(Object.keys(before.questionStats)).toEqual(['kh-b-01']);
});
