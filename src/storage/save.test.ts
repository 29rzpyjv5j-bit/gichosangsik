import { defaultSave, loadSave, saveSave, clearSave, STORAGE_KEY } from './save';
import { makeSave } from '../test/factories';

test('기본 상태는 상금 0, 기본 테마, 무료 아바타 3개를 갖는다', () => {
  const s = defaultSave();
  expect(s.version).toBe(1);
  expect(s.totalPrize).toBe(0);
  expect(s.wallet).toBe(0);
  expect(s.settings.theme).toBe('default');
  expect(s.owned.avatars).toEqual(['smile', 'chick', 'owl']);
});

test('저장한 뒤 불러오면 같은 값이 나온다', () => {
  const s = makeSave({ totalPrize: 123_000, wallet: 45_000 });
  expect(saveSave(s)).toBe('ok');
  const { state, warning } = loadSave();
  expect(warning).toBe('none');
  expect(state.totalPrize).toBe(123_000);
  expect(state.wallet).toBe(45_000);
});

test('저장된 값이 없으면 기본 상태를 준다', () => {
  const { state, warning } = loadSave();
  expect(warning).toBe('none');
  expect(state).toEqual(defaultSave());
});

test('깨진 JSON이면 기본 상태로 복구하고 알린다', () => {
  localStorage.setItem(STORAGE_KEY, '{이건 JSON이 아니다');
  const { state, warning } = loadSave();
  expect(warning).toBe('corrupted');
  expect(state).toEqual(defaultSave());
});

test('필드가 빠진 저장 값은 기본값으로 메워진다', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, totalPrize: 5000 }));
  const { state, warning } = loadSave();
  expect(warning).toBe('none');
  expect(state.totalPrize).toBe(5000);
  expect(state.wrongNotes).toEqual([]);
  expect(state.settings.theme).toBe('default');
});

test('localStorage를 쓸 수 없으면 unavailable을 알리고 죽지 않는다', () => {
  const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied');
  });
  const { state, warning } = loadSave();
  expect(warning).toBe('unavailable');
  expect(state).toEqual(defaultSave());
  spy.mockRestore();
});

test('초기화하면 저장 값이 지워진다', () => {
  saveSave(makeSave({ totalPrize: 1000 }));
  clearSave();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
