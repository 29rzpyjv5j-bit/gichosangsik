import type { ReactNode } from 'react';
import type { OutfitSlot } from '../types';

export type OutfitItem = {
  id: string;
  name: string;
  slot: OutfitSlot;
  price: number;
  unlockLevel: number;
  // 펭귄 몸(200x200 좌표)에 겹쳐 그리는 그림
  art: ReactNode;
  // 상점 카드에서 소품만 크게 보이도록 잘라낼 영역
  cardViewBox: string;
};

export const OUTFIT_SLOT_NAMES: Record<OutfitSlot, string> = {
  hat: '머리',
  neck: '목',
  face: '얼굴',
};

export const OUTFITS: OutfitItem[] = [
  {
    id: 'beret', name: '베레모', slot: 'hat', price: 30_000, unlockLevel: 1, cardViewBox: '48 14 104 58',
    art: (<>
      <ellipse cx="100" cy="60" rx="46" ry="11" fill="#e8684a" />
      <ellipse cx="100" cy="50" rx="38" ry="21" fill="url(#g-coral)" />
      <circle cx="100" cy="28" r="6" fill="#ffcf4d" />
    </>),
  },
  {
    id: 'flower', name: '꽃핀', slot: 'hat', price: 50_000, unlockLevel: 4, cardViewBox: '96 16 60 50',
    art: (<>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="126" cy="30" rx="7" ry="11" fill="#ffb0cc" transform={`rotate(${r} 126 40)`} />
      ))}
      <circle cx="126" cy="40" r="7" fill="url(#g-gold)" />
    </>),
  },
  {
    id: 'crown', name: '퀴즈왕 왕관', slot: 'hat', price: 150_000, unlockLevel: 10, cardViewBox: '56 14 88 54',
    art: (<>
      <path d="M66 62L70 30l16 16 14-22 14 22 16-16 4 32z" fill="url(#g-gold)" />
      <circle cx="100" cy="46" r="5" fill="#ff8a65" />
      <circle cx="80" cy="54" r="3.5" fill="#9ed9c4" /><circle cx="120" cy="54" r="3.5" fill="#c9b6ff" />
    </>),
  },
  {
    id: 'scarf', name: '민트 목도리', slot: 'neck', price: 30_000, unlockLevel: 2, cardViewBox: '50 114 100 56',
    art: (<>
      <path d="M58 122C80 134 120 134 142 122L142 136C120 148 80 148 58 136Z" fill="url(#g-mint)" />
      <path d="M118 138L134 166L116 162Z" fill="#6fc2a4" />
    </>),
  },
  {
    id: 'bowtie', name: '나비넥타이', slot: 'neck', price: 60_000, unlockLevel: 5, cardViewBox: '66 114 68 36',
    art: (<>
      <path d="M100 132L74 120V144Z" fill="url(#g-lav)" />
      <path d="M100 132L126 120V144Z" fill="url(#g-lav)" />
      <circle cx="100" cy="132" r="6" fill="#a58bf0" />
    </>),
  },
  {
    id: 'glasses', name: '동글 안경', slot: 'face', price: 80_000, unlockLevel: 8, cardViewBox: '62 72 76 40',
    art: (<>
      <circle cx="84" cy="92" r="13" fill="rgba(255,255,255,.25)" stroke="#5a3e36" strokeWidth="3.5" />
      <circle cx="116" cy="92" r="13" fill="rgba(255,255,255,.25)" stroke="#5a3e36" strokeWidth="3.5" />
      <path d="M97 92H103" stroke="#5a3e36" strokeWidth="3.5" />
    </>),
  },
];

export const OUTFIT_BY_ID: Record<string, OutfitItem> = Object.fromEntries(
  OUTFITS.map((o) => [o.id, o]),
);
