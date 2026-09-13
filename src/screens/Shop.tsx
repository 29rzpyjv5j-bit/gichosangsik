import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { AVATARS, THEMES } from '../data/shop';
import { ITEM_EMOJI, ITEM_PRICE } from '../domain/quizSession';
import type { ItemId } from '../domain/quizSession';
import { formatMoney } from '../components/Money';

const ITEM_DESC: Record<ItemId, string> = {
  half: '오답 보기 2개를 지웁니다 (OX 문제에서는 쓸 수 없어요)',
  hint: '정답을 말하지 않는 단서 한 줄을 보여줍니다',
  pass: '이 문제를 건너뜁니다 (오답노트에는 들어가요)',
};

export default function Shop() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const save = state.save;

  return (
    <div className="screen">
      <button
        type="button"
        className="muted"
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: 12 }}
        onClick={() => navigate('/')}
      >
        ‹ 홈
      </button>
      <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>상점</h2>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 18px' }}>
        지갑 <b>{formatMoney(save.wallet)}</b>
      </p>

      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>아이템</h3>
      <p className="muted" style={{ fontSize: 11, margin: '0 0 10px' }}>
        아이템은 퀴즈 화면에서 필요할 때 바로 사서 씁니다. 한 문제에 종류별 1회.
      </p>
      <div style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
        {(['half', 'hint', 'pass'] as ItemId[]).map((item) => (
          <div
            key={item}
            style={{
              border: '2px solid var(--border)', borderRadius: 12, padding: '10px 12px',
              display: 'flex', gap: 10, alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 20 }}>{ITEM_EMOJI[item]}</span>
            <span style={{ flex: 1, fontSize: 12 }}>
              <b style={{ display: 'block', fontSize: 13 }}>
                {item === 'half' ? '반반 찬스' : item === 'hint' ? '한 줄 힌트' : '패스'}
              </b>
              <span className="muted">{ITEM_DESC[item]}</span>
            </span>
            <b style={{ fontSize: 12 }}>{formatMoney(ITEM_PRICE[item])}</b>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>테마</h3>
      <div style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
        {THEMES.filter((t) => t.price > 0).map((theme) => {
          const owned = save.owned.themes.includes(theme.id);
          return (
            <div
              key={theme.id}
              style={{
                border: '2px solid var(--border)', borderRadius: 12, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{theme.name}</span>
              {owned ? (
                <span className="muted" style={{ fontSize: 12 }}>보유</span>
              ) : (
                <button
                  type="button"
                  className="thick"
                  disabled={save.wallet < theme.price}
                  onClick={() => dispatch({ type: 'BUY_THEME', theme: theme.id })}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
                >
                  {theme.name} {formatMoney(theme.price)}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>아바타</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {AVATARS.filter((a) => a.price > 0).map((avatar) => {
          const owned = save.owned.avatars.includes(avatar.id);
          return owned ? (
            <div key={avatar.id} style={{ textAlign: 'center', fontSize: 11 }}>
              <div style={{ fontSize: 26 }}>{avatar.emoji}</div>
              <span className="muted">보유</span>
            </div>
          ) : (
            <button
              key={avatar.id}
              type="button"
              className="thick"
              disabled={save.wallet < avatar.price}
              onClick={() => dispatch({ type: 'BUY_AVATAR', avatar: avatar.id })}
              style={{ width: 'auto', textAlign: 'center', padding: '8px 12px', fontSize: 11 }}
            >
              <span style={{ display: 'block', fontSize: 22 }}>{avatar.emoji}</span>
              {formatMoney(avatar.price)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
