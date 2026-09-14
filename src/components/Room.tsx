import type { OutfitSlot, RoomSlot, ThemeId } from '../types';
import type { GrowthStage } from '../domain/growth';
import { FURNITURE_BY_ID } from '../data/furniture';
import { THEME_BY_ID } from '../data/shop';
import { Penguin } from './Penguin';

const SLOT_STYLE: Record<RoomSlot, React.CSSProperties> = {
  wall: { top: '7%', left: '50%', width: 88, height: 88, transform: 'translateX(-50%)' },
  left: { bottom: '17%', left: '3%', width: 92, height: 92 },
  right: { bottom: '17%', right: '3%', width: 92, height: 92 },
  rug: { bottom: '4%', left: '15%', width: '70%', height: 58 },
};

export function Room({
  room,
  wallpaper,
  stage,
  outfit,
  height = 270,
}: {
  room: Partial<Record<RoomSlot, string>>;
  wallpaper: ThemeId;
  stage: GrowthStage['index'];
  outfit: Partial<Record<OutfitSlot, string>>;
  height?: number;
}) {
  const paper = THEME_BY_ID[wallpaper] ?? THEME_BY_ID.default;
  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: 30,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${paper.wall} 0%, ${paper.wall} 58%, ${paper.floor} 58%, ${paper.floor} 100%)`,
        boxShadow: 'inset 0 -6px 0 rgba(90,62,54,0.08), 0 12px 26px rgba(160,110,80,0.18)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '58%',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 2px, transparent 2.5px)',
          backgroundSize: '22px 22px',
        }}
      />
      {(['rug', 'wall', 'left', 'right'] as RoomSlot[]).map((slot) => {
        const item = room[slot] ? FURNITURE_BY_ID[room[slot]!] : undefined;
        if (!item) return null;
        return (
          <div key={slot} aria-label={item.name} style={{ position: 'absolute', ...SLOT_STYLE[slot] }}>
            {item.art}
          </div>
        );
      })}
      <div className="bob" style={{ position: 'absolute', left: '50%', bottom: '6%', marginLeft: -62 }}>
        <Penguin stage={stage} size={124} outfit={outfit} />
      </div>
    </div>
  );
}
