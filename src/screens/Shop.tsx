import { useSearchParams } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { THEMES } from '../data/shop';
import { FURNITURE, SLOT_NAMES } from '../data/furniture';
import { OUTFITS, OUTFIT_SLOT_NAMES } from '../data/outfits';
import { getLevel } from '../domain/level';
import { growthStageOf } from '../domain/growth';
import { formatMoney } from '../components/Money';
import { Penguin } from '../components/Penguin';
import { Room } from '../components/Room';
import { Icon } from '../components/Icons';
import type { OutfitSlot, RoomSlot } from '../types';

type Tab = 'furniture' | 'outfit' | 'wallpaper';
const TAB_NAMES: Record<Tab, string> = { furniture: '가구', outfit: '펭귄 꾸미기', wallpaper: '벽지' };

type CardState = 'using' | 'owned' | 'buy' | 'locked';

function ItemCard({
  name, sub, art, state, price, unlockLevel, canAfford, onClick,
}: {
  name: string; sub: string; art: React.ReactNode; state: CardState;
  price: number; unlockLevel: number; canAfford: boolean; onClick: () => void;
}) {
  const label =
    state === 'using' ? '사용 중' : state === 'owned' ? '보유' : state === 'locked' ? `Lv.${unlockLevel}` : formatMoney(price);
  return (
    <button
      type="button"
      aria-label={`${name} ${label}`}
      className="puffy"
      disabled={state === 'locked' || (state === 'buy' && !canAfford)}
      onClick={onClick}
      style={{
        border: state === 'using' ? '3px solid var(--accent)' : '3px solid transparent',
        padding: '8px 6px', borderRadius: 20, textAlign: 'center', color: 'var(--text)',
        opacity: state === 'locked' ? 0.6 : 1, position: 'relative',
      }}
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: state === 'locked' ? 'grayscale(.8)' : 'none' }}>
        {art}
      </div>
      <div style={{ fontSize: 12, fontWeight: 900 }}>{name}</div>
      <div className="muted" style={{ fontSize: 10 }}>{sub}</div>
      <div
        style={{
          marginTop: 4, fontSize: 11, fontWeight: 900, borderRadius: 99, padding: '2px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
          background: state === 'using' ? '#ffe2d6' : state === 'owned' ? '#e3f5dc' : state === 'locked' ? '#eee6f5' : '#fff3cf',
          color: state === 'using' ? 'var(--accent-shadow)' : state === 'owned' ? '#4c9a3c' : state === 'locked' ? '#8e80aa' : '#8a5a00',
        }}
      >
        {state === 'locked' && <Icon name="lock" size={14} />}
        {state === 'buy' && <Icon name="coin" size={14} />}
        {label}
      </div>
    </button>
  );
}

export default function Shop() {
  const { state, dispatch } = useGame();
  const save = state.save;
  const [params, setParams] = useSearchParams();
  const tab: Tab = (['furniture', 'outfit', 'wallpaper'] as Tab[]).find((t) => t === params.get('tab')) ?? 'furniture';
  const level = getLevel(save.totalPrize).level;
  const growth = growthStageOf(level);

  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 };

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 4px 12px' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>상점</h1>
        <span className="pill puffy">
          <Icon name="coin" size={22} />
          <span>{formatMoney(save.wallet)}</span>
        </span>
      </div>

      <div role="tablist" className="puffy" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: 5, borderRadius: 22, marginBottom: 12 }}>
        {(Object.keys(TAB_NAMES) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setParams({ tab: t }, { replace: true })}
            style={{
              border: 'none', borderRadius: 17, padding: '8px 0', fontSize: 13, fontWeight: 900,
              background: tab === t ? 'linear-gradient(180deg,#ffb89d,#ff8a65)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--muted)',
            }}
          >
            {TAB_NAMES[t]}
          </button>
        ))}
      </div>

      {tab === 'furniture' && (
        <>
          <Room room={save.settings.room} wallpaper={save.settings.theme} stage={growth.index} outfit={save.settings.outfit} height={200} />
          <p className="muted" style={{ fontSize: 11, margin: '8px 4px 10px' }}>
            한 자리에 가구 하나. 보유한 가구를 누르면 놓고, 놓인 가구를 누르면 치워요.
          </p>
          {(Object.keys(SLOT_NAMES) as RoomSlot[]).map((slot) => (
            <section key={slot} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, margin: '0 4px 6px' }}>{SLOT_NAMES[slot]}</h3>
              <div style={grid}>
                {FURNITURE.filter((f) => f.slot === slot).map((f) => {
                  const owned = save.owned.furniture.includes(f.id);
                  const using = save.settings.room[slot] === f.id;
                  const cardState: CardState = using ? 'using' : owned ? 'owned' : level < f.unlockLevel ? 'locked' : 'buy';
                  return (
                    <ItemCard
                      key={f.id}
                      name={f.name}
                      sub={SLOT_NAMES[slot]}
                      art={<div style={{ width: 60, height: 60 }}>{f.art}</div>}
                      state={cardState}
                      price={f.price}
                      unlockLevel={f.unlockLevel}
                      canAfford={save.wallet >= f.price}
                      onClick={() => {
                        if (cardState === 'using') dispatch({ type: 'PLACE_FURNITURE', slot, id: null });
                        else if (cardState === 'owned') dispatch({ type: 'PLACE_FURNITURE', slot, id: f.id });
                        else dispatch({ type: 'BUY_FURNITURE', id: f.id });
                      }}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}

      {tab === 'outfit' && (
        <>
          <div
            className="puffy"
            style={{ display: 'flex', justifyContent: 'center', padding: 10, borderRadius: 28, background: 'linear-gradient(180deg,#eaf7ff,#dff3d4)', marginBottom: 8 }}
          >
            <div className="bob"><Penguin stage={growth.index} size={130} outfit={save.settings.outfit} /></div>
          </div>
          {growth.index === 0 && (
            <p className="muted" style={{ fontSize: 11, margin: '0 4px 8px' }}>알에서 깨어나면(Lv.3) 옷을 입어 볼 수 있어요.</p>
          )}
          {(Object.keys(OUTFIT_SLOT_NAMES) as OutfitSlot[]).map((slot) => (
            <section key={slot} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, margin: '0 4px 6px' }}>{OUTFIT_SLOT_NAMES[slot]}</h3>
              <div style={grid}>
                {OUTFITS.filter((o) => o.slot === slot).map((o) => {
                  const owned = save.owned.outfits.includes(o.id);
                  const using = save.settings.outfit[slot] === o.id;
                  const cardState: CardState = using ? 'using' : owned ? 'owned' : level < o.unlockLevel ? 'locked' : 'buy';
                  return (
                    <ItemCard
                      key={o.id}
                      name={o.name}
                      sub={OUTFIT_SLOT_NAMES[slot]}
                      art={<svg viewBox={o.cardViewBox} width={60} height={60} aria-hidden>{o.art}</svg>}
                      state={cardState}
                      price={o.price}
                      unlockLevel={o.unlockLevel}
                      canAfford={save.wallet >= o.price}
                      onClick={() => {
                        if (cardState === 'using') dispatch({ type: 'WEAR_OUTFIT', slot, id: null });
                        else if (cardState === 'owned') dispatch({ type: 'WEAR_OUTFIT', slot, id: o.id });
                        else dispatch({ type: 'BUY_OUTFIT', id: o.id });
                      }}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}

      {tab === 'wallpaper' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {THEMES.map((theme) => {
            const owned = save.owned.themes.includes(theme.id);
            const using = save.settings.theme === theme.id;
            const cardState: CardState = using ? 'using' : owned ? 'owned' : 'buy';
            return (
              <ItemCard
                key={theme.id}
                name={theme.name}
                sub="벽지"
                art={
                  <div
                    style={{
                      width: 90, height: 60, borderRadius: 14,
                      background: `linear-gradient(180deg, ${theme.wall} 0 60%, ${theme.floor} 60% 100%)`,
                      boxShadow: 'inset 0 2px 0 rgba(255,255,255,.6), 0 3px 8px rgba(160,110,80,.2)',
                    }}
                  />
                }
                state={cardState}
                price={theme.price}
                unlockLevel={1}
                canAfford={save.wallet >= theme.price}
                onClick={() => {
                  if (cardState === 'owned') dispatch({ type: 'SET_THEME', theme: theme.id });
                  else if (cardState === 'buy') dispatch({ type: 'BUY_THEME', theme: theme.id });
                }}
              />
            );
          })}
        </div>
      )}

      <p className="muted" style={{ fontSize: 11, margin: '14px 4px 0' }}>
        반반 찬스·한 줄 힌트·패스는 퀴즈 화면에서 필요할 때 바로 사서 써요.
      </p>
    </div>
  );
}
