import type { ReactNode } from 'react';
import type { RoomSlot } from '../types';

export type FurnitureItem = {
  id: string;
  name: string;
  slot: RoomSlot;
  price: number;
  unlockLevel: number;
  art: ReactNode;
};

export const SLOT_NAMES: Record<RoomSlot, string> = {
  wall: '벽',
  left: '왼쪽 바닥',
  right: '오른쪽 바닥',
  rug: '러그',
};

// 말랑한 입체감: 밝은 윗면 하이라이트 + 아래쪽 어두운 면
const shine = (cx: number, cy: number, rx: number, ry: number) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity="0.45" />
);

const rug = (color: string, edge: string) => (
  <svg viewBox="0 0 100 40">
    <ellipse cx="50" cy="22" rx="48" ry="17" fill={edge} />
    <ellipse cx="50" cy="19" rx="48" ry="17" fill={color} />
    <ellipse cx="50" cy="19" rx="34" ry="10" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" strokeDasharray="4 5" />
  </svg>
);

export const FURNITURE: FurnitureItem[] = [
  {
    id: 'window', name: '햇살 창문', slot: 'wall', price: 40_000, unlockLevel: 1,
    art: (
      <svg viewBox="0 0 100 100">
        <rect x="12" y="10" width="76" height="80" rx="18" fill="#f3c9a8" />
        <rect x="18" y="16" width="64" height="68" rx="13" fill="#bfe3ff" />
        <circle cx="64" cy="36" r="11" fill="#ffd66b" />
        <ellipse cx="38" cy="58" rx="16" ry="8" fill="#fff" />
        <path d="M50 16 V84 M18 50 H82" stroke="#f3c9a8" strokeWidth="5" />
        {shine(34, 26, 12, 5)}
      </svg>
    ),
  },
  {
    id: 'frame', name: '꽃 액자', slot: 'wall', price: 30_000, unlockLevel: 2,
    art: (
      <svg viewBox="0 0 100 100">
        <rect x="18" y="14" width="64" height="72" rx="16" fill="#c9b6ff" />
        <rect x="26" y="22" width="48" height="56" rx="10" fill="#fff6ee" />
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="50" cy="38" rx="7" ry="11" fill="#ffab91" transform={`rotate(${r} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="7" fill="#ffd66b" />
        {shine(40, 22, 12, 4)}
      </svg>
    ),
  },
  {
    id: 'clock', name: '말랑 시계', slot: 'wall', price: 20_000, unlockLevel: 5,
    art: (
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="54" r="36" fill="#9ed9c4" />
        <circle cx="50" cy="50" r="36" fill="#b8ecd8" />
        <circle cx="50" cy="50" r="27" fill="#fffaf4" />
        <path d="M50 50 V32 M50 50 L63 58" stroke="#5a3e36" strokeWidth="4" strokeLinecap="round" />
        {shine(38, 26, 12, 5)}
      </svg>
    ),
  },
  {
    id: 'plant', name: '동글 화분', slot: 'left', price: 20_000, unlockLevel: 1,
    art: (
      <svg viewBox="0 0 100 100">
        <circle cx="38" cy="36" r="17" fill="#8fd19e" />
        <circle cx="60" cy="30" r="19" fill="#a6e0b1" />
        <circle cx="52" cy="50" r="17" fill="#8fd19e" />
        <path d="M30 60 H70 L64 92 H36 Z" fill="#ff9a76" />
        <rect x="26" y="56" width="48" height="12" rx="6" fill="#ffb199" />
        {shine(56, 22, 9, 4)}
      </svg>
    ),
  },
  {
    id: 'bookshelf', name: '상식 책장', slot: 'left', price: 80_000, unlockLevel: 7,
    art: (
      <svg viewBox="0 0 100 100">
        <rect x="16" y="8" width="68" height="88" rx="14" fill="#e8a87c" />
        <rect x="24" y="16" width="52" height="30" rx="6" fill="#fff1e6" />
        <rect x="24" y="54" width="52" height="30" rx="6" fill="#fff1e6" />
        {[28, 36, 44, 54].map((x, i) => (
          <rect key={x} x={x} y="22" width="7" height="24" rx="3" fill={['#ffab91', '#c9b6ff', '#8fd19e', '#ffd66b'][i]} />
        ))}
        {[30, 40, 50].map((x, i) => (
          <rect key={x} x={x} y="60" width="8" height="24" rx="3" fill={['#9ed9f5', '#ffab91', '#c9b6ff'][i]} />
        ))}
        {shine(40, 12, 16, 3)}
      </svg>
    ),
  },
  {
    id: 'lamp', name: '구름 스탠드', slot: 'left', price: 40_000, unlockLevel: 4,
    art: (
      <svg viewBox="0 0 100 100">
        <rect x="47" y="40" width="6" height="46" rx="3" fill="#d9b99b" />
        <ellipse cx="50" cy="90" rx="20" ry="6" fill="#d9b99b" />
        <circle cx="36" cy="34" r="14" fill="#ffe28a" />
        <circle cx="54" cy="26" r="17" fill="#fff0a8" />
        <circle cx="66" cy="36" r="12" fill="#ffe28a" />
        {shine(50, 18, 9, 4)}
      </svg>
    ),
  },
  {
    id: 'globe', name: '지구본', slot: 'right', price: 60_000, unlockLevel: 3,
    art: (
      <svg viewBox="0 0 100 100">
        <path d="M50 74 V88" stroke="#c9a27e" strokeWidth="6" />
        <ellipse cx="50" cy="90" rx="18" ry="6" fill="#c9a27e" />
        <circle cx="50" cy="42" r="30" fill="#8cc8f0" />
        <path d="M32 30 C42 26 44 40 36 46 C30 50 26 38 32 30 Z M56 50 C66 44 76 52 70 62 C62 68 52 60 56 50 Z" fill="#8fd19e" />
        <path d="M22 42 A28 28 0 0 0 78 42" fill="none" stroke="#c9a27e" strokeWidth="4" />
        {shine(40, 26, 12, 6)}
      </svg>
    ),
  },
  {
    id: 'trophy', name: '퀴즈왕 트로피', slot: 'right', price: 150_000, unlockLevel: 12,
    art: (
      <svg viewBox="0 0 100 100">
        <path d="M30 18 H70 V40 C70 56 60 64 50 64 C40 64 30 56 30 40 Z" fill="#ffc94d" />
        <path d="M30 26 H18 C18 42 26 46 32 46 M70 26 H82 C82 42 74 46 68 46" fill="none" stroke="#ffc94d" strokeWidth="6" />
        <rect x="44" y="62" width="12" height="14" fill="#f0a830" />
        <rect x="30" y="76" width="40" height="14" rx="6" fill="#e8a87c" />
        {shine(42, 26, 8, 6)}
      </svg>
    ),
  },
  {
    id: 'books', name: '책 더미', slot: 'right', price: 30_000, unlockLevel: 2,
    art: (
      <svg viewBox="0 0 100 100">
        <rect x="18" y="70" width="64" height="16" rx="6" fill="#ffab91" />
        <rect x="24" y="54" width="54" height="16" rx="6" fill="#c9b6ff" />
        <rect x="20" y="38" width="58" height="16" rx="6" fill="#8fd19e" />
        <rect x="30" y="22" width="44" height="16" rx="6" fill="#ffd66b" />
        {shine(44, 26, 10, 3)}
      </svg>
    ),
  },
  { id: 'rug-peach', name: '복숭아 러그', slot: 'rug', price: 30_000, unlockLevel: 1, art: rug('#ffc4a8', '#f4a888') },
  { id: 'rug-mint', name: '민트 러그', slot: 'rug', price: 30_000, unlockLevel: 3, art: rug('#b8ecd8', '#93d6bd') },
  { id: 'rug-lavender', name: '라벤더 러그', slot: 'rug', price: 30_000, unlockLevel: 6, art: rug('#d8ccff', '#bcaaf5') },
];

export const FURNITURE_BY_ID: Record<string, FurnitureItem> = Object.fromEntries(
  FURNITURE.map((f) => [f.id, f]),
);
