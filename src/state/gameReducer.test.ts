import { gameReducer, initialAppState, type AppState } from './gameReducer';
import { makeSave, makeQuestion } from '../test/factories';
import { stageKey } from '../types';
import type { Question, SaveState } from '../types';

const five = (tier: 'basic' | 'mid' = 'basic'): Question[] =>
  Array.from({ length: 5 }, (_, i) =>
    makeQuestion({
      id: `sc-${tier === 'basic' ? 'b' : 'm'}-0${i + 1}`,
      tier,
      choices: ['가', '나', '다', '라'],
      answerIndex: 1,
    }),
  );

function start(save: SaveState = makeSave()): AppState {
  const state = initialAppState(save, 'none');
  return gameReducer(state, {
    type: 'START_STAGE', category: 'science', tier: 'basic', stage: 1, questions: five(),
  });
}

function playAll(state: AppState, picks: number[]): AppState {
  let s = state;
  for (const pick of picks) {
    s = gameReducer(s, { type: 'ANSWER', choiceIndex: pick });
    s = gameReducer(s, { type: 'NEXT' });
  }
  return s;
}

test('스테이지를 시작하면 세션이 만들어진다', () => {
  const s = start();
  expect(s.session?.questions).toHaveLength(5);
  expect(s.session?.mode).toEqual({
    kind: 'stage', category: 'science', tier: 'basic', stage: 1,
  });
});

test('시작 시점의 정답 이력이 세션에 박힌다', () => {
  const save = makeSave({ questionStats: { 'sc-b-01': { correct: 2, wrong: 0 } } });
  const s = start(save);
  expect(s.session?.alreadyCorrect).toEqual([true, false, false, false, false]);
});

test('만점 클리어를 끝내면 상금·기록·뱃지가 반영된다', () => {
  let s = playAll(start(), [1, 1, 1, 1, 1]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });

  expect(s.session).toBeNull();
  expect(s.lastResult?.cleared).toBe(true);
  expect(s.lastResult?.correctCount).toBe(5);
  // 정답 5개 50,000 + 첫 클리어 20,000 + 만점 30,000
  expect(s.lastResult?.totalPrize).toBe(100_000);
  expect(s.save.totalPrize).toBe(100_000);
  expect(s.save.wallet).toBe(100_000);
  expect(s.save.stages[stageKey('science', 'basic', 1)])
    .toEqual({ cleared: true, bestCorrect: 5, plays: 1 });
  expect(s.save.perfectCount).toBe(1);
  expect(s.save.lastPlayed).toEqual({ category: 'science', tier: 'basic', stage: 1 });
  expect(s.lastResult?.newBadges).toContain('perfect-1');
  expect(s.save.badges.map((b) => b.id)).toContain('perfect-1');
});

test('틀린 문제는 오답노트에 들어가고 클리어에 실패하면 보너스가 없다', () => {
  let s = playAll(start(), [1, 1, 0, 0, 0]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });

  expect(s.lastResult?.cleared).toBe(false);
  expect(s.save.totalPrize).toBe(20_000);
  expect(s.save.wrongNotes).toEqual(['sc-b-03', 'sc-b-04', 'sc-b-05']);
  expect(s.save.stages[stageKey('science', 'basic', 1)].cleared).toBe(false);
  expect(s.save.perfectCount).toBe(0);
});

test('재도전에서는 이미 맞힌 문제가 절반이고 보너스가 붙지 않는다', () => {
  const save = makeSave({
    stages: { [stageKey('science', 'basic', 1)]: { cleared: true, bestCorrect: 5, plays: 1 } },
    questionStats: Object.fromEntries(
      five().map((q) => [q.id, { correct: 1, wrong: 0 }]),
    ),
  });
  let s = playAll(start(save), [1, 1, 1, 1, 1]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });

  expect(s.lastResult?.totalPrize).toBe(25_000);
  expect(s.save.stages[stageKey('science', 'basic', 1)].plays).toBe(2);
});

test('아이템을 쓰면 지갑에서 바로 빠진다', () => {
  let s = start(makeSave({ wallet: 100_000 }));
  s = gameReducer(s, { type: 'USE_ITEM', item: 'hint' });
  expect(s.save.wallet).toBe(70_000);
  expect(s.session?.hintOpen[0]).toBe(true);
});

test('잔액이 부족하면 아이템이 적용되지 않는다', () => {
  let s = start(makeSave({ wallet: 1_000 }));
  s = gameReducer(s, { type: 'USE_ITEM', item: 'hint' });
  expect(s.save.wallet).toBe(1_000);
  expect(s.session?.hintOpen[0]).toBeUndefined();
});

test('중간에 그만두면 기록이 남지 않지만 쓴 아이템 비용은 돌아오지 않는다', () => {
  let s = start(makeSave({ wallet: 100_000 }));
  s = gameReducer(s, { type: 'USE_ITEM', item: 'hint' });
  s = gameReducer(s, { type: 'ANSWER', choiceIndex: 0 });
  s = gameReducer(s, { type: 'ABANDON' });

  expect(s.session).toBeNull();
  expect(s.lastResult).toBeNull();
  expect(s.save.wallet).toBe(70_000);
  expect(s.save.wrongNotes).toEqual([]);
  expect(s.save.stages).toEqual({});
});

test('볼게임을 끝내면 완료 횟수와 보너스 날짜가 기록된다', () => {
  let s = initialAppState(makeSave(), 'none');
  s = gameReducer(s, { type: 'START_DAILY', questions: five() });
  s = playAll(s, [1, 1, 1, 0, 0]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });

  expect(s.save.dailyGame).toEqual({ lastBonusDate: '2026-09-13', completed: 1 });
  // 정답 3개 30,000 + 완료 보너스 30,000
  expect(s.lastResult?.totalPrize).toBe(60_000);

  // 같은 날 두 번째 판에는 보너스가 없다
  let t = gameReducer(s, { type: 'START_DAILY', questions: five() });
  t = playAll(t, [1, 1, 1, 0, 0]);
  t = gameReducer(t, { type: 'FINISH', today: '2026-09-13' });
  expect(t.lastResult?.totalPrize).toBe(15_000); // 이미 맞힌 3문제 × 5,000
  expect(t.save.dailyGame.completed).toBe(2);
});

test('오답노트 복습에서 맞히면 노트에서 빠지고 5,000원을 받는다', () => {
  const save = makeSave({ wrongNotes: ['sc-b-01', 'sc-b-02'], wrongNotesEverAdded: 2 });
  let s = initialAppState(save, 'none');
  s = gameReducer(s, { type: 'START_REVIEW', questions: five().slice(0, 2) });
  s = playAll(s, [1, 0]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });

  expect(s.save.wrongNotes).toEqual(['sc-b-02']);
  expect(s.save.wrongNotesResolved).toBe(1);
  expect(s.lastResult?.totalPrize).toBe(5_000);
});

test('레벨이 오르면 결과에 레벨업이 담긴다', () => {
  const save = makeSave({ totalPrize: 90_000, wallet: 0 });
  let s = playAll(start(save), [1, 1, 1, 1, 1]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });
  expect(s.lastResult?.levelUp).toEqual({ level: 2, title: '아는 척 초보' });
});

test('레벨이 그대로면 레벨업이 없다', () => {
  let s = playAll(start(), [1, 1, 0, 0, 0]);
  s = gameReducer(s, { type: 'FINISH', today: '2026-09-13' });
  expect(s.lastResult?.levelUp).toBeNull();
});

test('테마를 사면 지갑에서 빠지고 보유 목록에 들어간다', () => {
  let s = initialAppState(makeSave({ wallet: 500_000 }), 'none');
  s = gameReducer(s, { type: 'BUY_THEME', theme: 'apricot' });
  expect(s.save.wallet).toBe(200_000);
  expect(s.save.owned.themes).toContain('apricot');
  expect(s.save.totalPrize).toBe(0);
});

test('이미 가진 테마를 다시 사지 않는다', () => {
  let s = initialAppState(makeSave({ wallet: 500_000, owned: { themes: ['default', 'apricot'], avatars: ['smile'] } }), 'none');
  s = gameReducer(s, { type: 'BUY_THEME', theme: 'apricot' });
  expect(s.save.wallet).toBe(500_000);
});

test('가진 테마만 적용할 수 있다', () => {
  let s = initialAppState(makeSave(), 'none');
  s = gameReducer(s, { type: 'SET_THEME', theme: 'night' });
  expect(s.save.settings.theme).toBe('default');
});

test('전체 초기화하면 기본 상태로 돌아간다', () => {
  let s = initialAppState(makeSave({ totalPrize: 500_000, wallet: 500_000 }), 'none');
  s = gameReducer(s, { type: 'RESET_ALL' });
  expect(s.save.totalPrize).toBe(0);
  expect(s.save.wallet).toBe(0);
  expect(s.save.badges).toEqual([]);
});
