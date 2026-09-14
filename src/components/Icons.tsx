import type { ReactNode } from 'react';
import type { CategoryId } from '../types';

// 앱 전체에서 공유하는 입체 그라데이션. App에 한 번만 마운트한다.
export function GradientDefs() {
  const radial = (id: string, stops: [string, string, string]) => (
    <radialGradient id={id} cx="35%" cy="30%" r="78%">
      <stop offset="0" stopColor={stops[0]} />
      <stop offset="0.6" stopColor={stops[1]} />
      <stop offset="1" stopColor={stops[2]} />
    </radialGradient>
  );
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        {radial('pg-baby', ['#d7dde6', '#aab4c2', '#8e99aa'])}
        {radial('pg-body', ['#6f84a8', '#43557a', '#2f3d5a'])}
        {radial('pg-belly', ['#ffffff', '#f7f0e7', '#efe4d8'])}
        {radial('pg-beak', ['#ffd3a1', '#ffb070', '#ff9a52'])}
        {radial('g-gold', ['#fff3b0', '#ffcf4d', '#f0a830'])}
        {radial('g-coral', ['#ffd6c6', '#ff9a78', '#e8684a'])}
        {radial('g-lav', ['#f1ecff', '#c9b6ff', '#a58bf0'])}
        {radial('g-mint', ['#e3fbef', '#9ed9c4', '#6fc2a4'])}
        {radial('g-sky', ['#eaf6ff', '#9ed0f5', '#6fb3e6'])}
      </defs>
    </svg>
  );
}

export type IconName =
  | 'coin' | 'map' | 'book' | 'medal' | 'shop' | 'penguin' | 'lock' | 'gift' | 'flag'
  | 'sprout' | 'tree' | 'mount' | 'dice' | 'party' | 'compass' | 'star'
  | 'scissors' | 'bulb' | 'skip' | 'broom' | 'cloud' | 'boat';

const ICONS: Record<IconName, ReactNode> = {
  coin: (<>
    <circle cx="20" cy="22" r="15" fill="#e8a020" /><circle cx="20" cy="19" r="15" fill="url(#g-gold)" />
    <path d="M20 11l2.4 5 5.4.6-4 3.7 1.1 5.4L20 23l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="#fff4c4" />
    <ellipse cx="14" cy="12" rx="5" ry="2.5" fill="#fff" opacity=".6" />
  </>),
  map: (<>
    <path d="M6 11l9-4 10 4 9-4v22l-9 4-10-4-9 4z" fill="#f4c7a8" />
    <path d="M6 9l9-4 10 4 9-4v22l-9 4-10-4-9 4z" fill="#ffe6d2" />
    <path d="M15 5v22M25 9v22" stroke="#f4c7a8" strokeWidth="2" />
    <circle cx="21" cy="17" r="3.5" fill="#ff8a65" />
    <path d="M9 22c4-3 7 2 11-2" stroke="#9ed9c4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </>),
  book: (<>
    <rect x="8" y="8" width="24" height="27" rx="5" fill="#e8684a" />
    <rect x="8" y="6" width="24" height="27" rx="5" fill="url(#g-coral)" />
    <rect x="12" y="10" width="4" height="19" rx="2" fill="#fff" opacity=".55" />
    <path d="M20 14h8M20 19h6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
  </>),
  medal: (<>
    <path d="M12 4h7l3 11h-7zM28 4h-7l-3 11h7z" fill="#c9b6ff" />
    <circle cx="20" cy="26" r="11" fill="#e8a020" /><circle cx="20" cy="24" r="11" fill="url(#g-gold)" />
    <path d="M20 18l1.8 3.7 4 .5-3 2.8.8 4-3.6-2-3.6 2 .8-4-3-2.8 4-.5z" fill="#fff4c4" />
  </>),
  shop: (<>
    <rect x="8" y="17" width="24" height="18" rx="4" fill="#ffe6d2" />
    <path d="M6 10h28l-2 9H8z" fill="#ff9a78" />
    <path d="M13 10l-2 9M20 10v9M27 10l2 9" stroke="#fff" strokeWidth="3" />
    <rect x="16" y="24" width="8" height="11" rx="3" fill="url(#g-mint)" />
  </>),
  penguin: (<>
    <ellipse cx="20" cy="22" rx="15" ry="15" fill="url(#pg-baby)" />
    <ellipse cx="20" cy="24" rx="11" ry="10" fill="url(#pg-belly)" />
    <circle cx="15.5" cy="21" r="2" fill="#2a2f3f" /><circle cx="24.5" cy="21" r="2" fill="#2a2f3f" />
    <path d="M18 25h4l-2 3z" fill="#ff9f5a" />
    <ellipse cx="12" cy="26" rx="2.4" ry="1.4" fill="#ffb3b3" /><ellipse cx="28" cy="26" rx="2.4" ry="1.4" fill="#ffb3b3" />
  </>),
  lock: (<>
    <path d="M13 18v-4a7 7 0 0114 0v4" stroke="#a58bf0" strokeWidth="4" fill="none" />
    <rect x="9" y="17" width="22" height="18" rx="6" fill="url(#g-lav)" />
    <circle cx="20" cy="26" r="3" fill="#7c63c9" />
  </>),
  gift: (<>
    <rect x="7" y="15" width="26" height="20" rx="5" fill="url(#g-lav)" />
    <rect x="5" y="11" width="30" height="8" rx="4" fill="#d8ccff" />
    <rect x="18" y="11" width="4" height="24" fill="#ffcf4d" />
    <path d="M20 11c-4-7-10-4-6 0M20 11c4-7 10-4 6 0" stroke="#ffcf4d" strokeWidth="3" fill="none" />
  </>),
  flag: (<>
    <rect x="10" y="5" width="3.5" height="31" rx="1.7" fill="#c9a27e" />
    <path d="M13 7h19l-5 6 5 6H13z" fill="url(#g-coral)" />
    <ellipse cx="12" cy="36" rx="7" ry="2.5" fill="rgba(0,0,0,.12)" />
  </>),
  sprout: (<>
    <path d="M20 34V20" stroke="#6fc2a4" strokeWidth="3.5" strokeLinecap="round" />
    <ellipse cx="13" cy="17" rx="8" ry="5" fill="url(#g-mint)" transform="rotate(-25 13 17)" />
    <ellipse cx="27" cy="14" rx="9" ry="5.5" fill="url(#g-mint)" transform="rotate(25 27 14)" />
  </>),
  tree: (<>
    <rect x="18" y="24" width="4" height="12" rx="2" fill="#c9a27e" />
    <circle cx="20" cy="17" r="12" fill="url(#g-mint)" />
    <circle cx="15" cy="12" r="3" fill="#fff" opacity=".45" />
  </>),
  mount: (<>
    <path d="M3 34L16 10l8 12 4-6 9 18z" fill="url(#g-lav)" />
    <path d="M16 10l4 7-4 2-3-3zM28 16l3 5-3 1-2-2z" fill="#fff" />
  </>),
  dice: (<>
    <rect x="7" y="9" width="26" height="26" rx="8" fill="#e8684a" />
    <rect x="7" y="6" width="26" height="26" rx="8" fill="url(#g-coral)" />
    <circle cx="14" cy="13" r="2.4" fill="#fff" /><circle cx="20" cy="19" r="2.4" fill="#fff" /><circle cx="26" cy="25" r="2.4" fill="#fff" />
  </>),
  party: (<>
    <path d="M8 34l8-20 12 12z" fill="url(#g-gold)" />
    <circle cx="28" cy="10" r="2.5" fill="#ff8a65" /><circle cx="33" cy="18" r="2" fill="#9ed9c4" /><circle cx="22" cy="6" r="2" fill="#c9b6ff" />
  </>),
  compass: (<>
    <circle cx="20" cy="21" r="16" fill="#f4c7a8" /><circle cx="20" cy="19" r="16" fill="#fff8f0" />
    <path d="M20 6l4 13-4 13-4-13z" fill="#ff8a65" /><path d="M20 19h4l-4 13-4-13z" fill="#c9b6ff" />
    <circle cx="20" cy="19" r="2.5" fill="#fff" />
  </>),
  star: (<>
    <path d="M20 5l4.4 9 9.9 1.2-7.3 6.8 1.9 9.8L20 27l-8.9 4.8 1.9-9.8-7.3-6.8 9.9-1.2z" fill="url(#g-gold)" />
    <ellipse cx="16" cy="13" rx="3" ry="2" fill="#fff" opacity=".6" />
  </>),
  scissors: (<>
    <circle cx="12" cy="29" r="6" fill="none" stroke="#e8684a" strokeWidth="3.5" />
    <circle cx="28" cy="29" r="6" fill="none" stroke="#e8684a" strokeWidth="3.5" />
    <path d="M15 24L28 6M25 24L12 6" stroke="#a58bf0" strokeWidth="3.5" strokeLinecap="round" />
  </>),
  bulb: (<>
    <circle cx="20" cy="17" r="11" fill="url(#g-gold)" />
    <rect x="15" y="26" width="10" height="8" rx="3" fill="#c9b6ff" />
    <ellipse cx="16" cy="12" rx="3.5" ry="2.2" fill="#fff" opacity=".7" />
  </>),
  skip: (<>
    <path d="M6 8l14 12L6 32z" fill="url(#g-mint)" />
    <path d="M18 8l14 12-14 12z" fill="url(#g-sky)" />
  </>),
  broom: (<>
    <path d="M26 4L17 22" stroke="#c9a27e" strokeWidth="4" strokeLinecap="round" />
    <path d="M12 20l10 5-4 11c-6 0-12-4-13-8z" fill="url(#g-gold)" />
  </>),
  cloud: (<>
    <ellipse cx="13" cy="24" rx="10" ry="7" fill="#fff" /><ellipse cx="23" cy="19" rx="11" ry="9" fill="#fff" /><ellipse cx="31" cy="25" rx="7" ry="6" fill="#fff" />
  </>),
  boat: (<>
    <path d="M4 24h32l-5 9H9z" fill="url(#g-coral)" />
    <path d="M19 4v20M20 5l11 16H20z" fill="#fff8f0" stroke="#c9a27e" strokeWidth="1.5" />
  </>),
};

export function Icon({ name, size = 24, style }: { name: IconName; size?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden style={{ flex: '0 0 auto', ...style }}>
      {ICONS[name]}
    </svg>
  );
}

const LANDMARKS: Record<CategoryId, ReactNode> = {
  'korean-history': (<>
    <rect x="14" y="30" width="32" height="18" rx="3" fill="#ffe6d2" />
    <rect x="25" y="36" width="10" height="12" rx="4" fill="#e8684a" />
    <path d="M6 32c8-2 14-10 24-12 10 2 16 10 24 12-6 2-12 0-24 0s-18 2-24 0z" fill="url(#g-coral)" />
    <path d="M12 22c6-1 10-6 18-8 8 2 12 7 18 8-5 2-10 0-18 0s-13 2-18 0z" fill="#7c63c9" />
  </>),
  science: (<>
    <path d="M24 8h12v14l12 22a6 6 0 01-5 8H17a6 6 0 01-5-8l12-22z" fill="#eaf6ff" />
    <path d="M15 38h30l3 6a6 6 0 01-5 8H17a6 6 0 01-5-8z" fill="url(#g-mint)" />
    <rect x="22" y="5" width="16" height="5" rx="2.5" fill="#c9b6ff" />
    <circle cx="26" cy="44" r="2.5" fill="#fff" /><circle cx="34" cy="40" r="1.8" fill="#fff" />
  </>),
  'world-history': (<>
    <path d="M30 8l24 40H6z" fill="url(#g-gold)" />
    <path d="M30 8l24 40H30z" fill="#e8a020" opacity=".5" />
    <path d="M14 36h32M20 26h20" stroke="#fff" strokeWidth="1.5" opacity=".7" />
  </>),
  math: (<>
    <path d="M10 48V14l30 34z" fill="url(#g-lav)" />
    <path d="M16 42V28l12 14z" fill="#fff8f0" />
    <circle cx="44" cy="22" r="10" fill="url(#g-coral)" />
    <path d="M40 22h8M44 18v8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
  </>),
  music: (<>
    <path d="M24 12l22-5v30M24 12v32" stroke="#a58bf0" strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="18" cy="45" rx="9" ry="7" fill="url(#g-lav)" /><ellipse cx="40" cy="38" rx="9" ry="7" fill="url(#g-lav)" />
  </>),
  art: (<>
    <path d="M30 8C14 8 6 20 6 30s8 20 20 20c6 0 6-6 2-8s0-8 6-8h8c8 0 12-4 12-12C54 14 44 8 30 8z" fill="#fff0dc" />
    <circle cx="20" cy="22" r="4.5" fill="#ff8a65" /><circle cx="32" cy="17" r="4.5" fill="#ffcf4d" />
    <circle cx="43" cy="24" r="4.5" fill="#9ed9c4" /><circle cx="17" cy="35" r="4.5" fill="#c9b6ff" />
  </>),
  'current-affairs': (<>
    <rect x="10" y="12" width="40" height="36" rx="6" fill="#e8a87c" />
    <rect x="10" y="10" width="40" height="36" rx="6" fill="#fff8f0" />
    <rect x="16" y="16" width="16" height="12" rx="3" fill="url(#g-sky)" />
    <path d="M36 18h8M36 24h8M16 34h28M16 40h20" stroke="#e8a87c" strokeWidth="2.6" strokeLinecap="round" />
  </>),
};

export function Landmark({ category, size = 40 }: { category: CategoryId; size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden style={{ flex: '0 0 auto' }}>
      {LANDMARKS[category]}
    </svg>
  );
}

export const ISLAND_COLOR: Record<CategoryId, string> = {
  'korean-history': '#ffc4a8',
  science: '#fff0a8',
  'world-history': '#bfeed9',
  math: '#ddd2ff',
  music: '#ffd6e5',
  art: '#d6ecff',
  'current-affairs': '#ffe2c0',
};

export function IslandShape({ color, width }: { color: string; width: number }) {
  return (
    <svg viewBox="0 0 160 100" width={width} height={width * 0.625} aria-hidden style={{ display: 'block' }}>
      <path d="M18 60C8 40 30 18 60 20c14-12 44-12 58 2 26 2 40 22 30 40-6 20-40 30-70 28C44 92 24 80 18 60z" fill="#f4dcb8" />
      <path d="M18 54C10 36 32 16 60 18c14-11 42-11 56 2 24 3 36 20 28 36-6 16-38 26-66 24C46 82 24 72 18 54z" fill={color} />
      <ellipse cx="54" cy="30" rx="22" ry="6" fill="#fff" opacity=".35" />
    </svg>
  );
}
