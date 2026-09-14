import { GROWTH_STAGES, type GrowthStage } from '../domain/growth';
import { OUTFIT_BY_ID } from '../data/outfits';
import type { OutfitSlot } from '../types';

const EYE = '#2a2f3f';
const CHEEK = '#ffb3b3';

function Eyes() {
  return (
    <>
      <circle cx="83" cy="92" r="8" fill={EYE} />
      <circle cx="117" cy="92" r="8" fill={EYE} />
      <circle cx="86" cy="89" r="3" fill="#fff" />
      <circle cx="120" cy="89" r="3" fill="#fff" />
    </>
  );
}

function Egg() {
  return (
    <g>
      <path
        d="M100 28C150 28 166 108 166 136C166 170 138 186 100 186C62 186 34 170 34 136C34 108 50 28 100 28Z"
        fill="url(#pg-belly)"
        stroke="#f0dfc4"
        strokeWidth="3"
      />
      <path d="M56 78C70 34 130 34 144 78L130 90L116 74L100 92L84 74L70 90Z" fill="url(#pg-body)" />
      <circle cx="84" cy="118" r="7" fill={EYE} />
      <circle cx="116" cy="118" r="7" fill={EYE} />
      <circle cx="86.5" cy="115.5" r="2.4" fill="#fff" />
      <circle cx="118.5" cy="115.5" r="2.4" fill="#fff" />
      <ellipse cx="70" cy="134" rx="9" ry="5.5" fill={CHEEK} />
      <ellipse cx="130" cy="134" rx="9" ry="5.5" fill={CHEEK} />
      <path d="M92 128Q100 125 108 128L100 138Z" fill="url(#pg-beak)" />
      <ellipse cx="80" cy="52" rx="16" ry="7" fill="#fff" opacity=".4" />
    </g>
  );
}

function Body({ stage, outfit }: { stage: 1 | 2 | 3 | 4; outfit: Partial<Record<OutfitSlot, string>> }) {
  const fill = stage === 1 ? 'url(#pg-baby)' : 'url(#pg-body)';
  const scale = [0, 0.74, 0.86, 0.95, 1][stage];
  const hat = outfit.hat ? OUTFIT_BY_ID[outfit.hat] : undefined;
  const neck = outfit.neck ? OUTFIT_BY_ID[outfit.neck] : undefined;
  const face = outfit.face ? OUTFIT_BY_ID[outfit.face] : undefined;

  return (
    <g transform={`translate(100 184) scale(${scale}) translate(-100 -184)`}>
      <ellipse cx="82" cy="180" rx="15" ry="8" fill="url(#pg-beak)" />
      <ellipse cx="118" cy="180" rx="15" ry="8" fill="url(#pg-beak)" />
      <ellipse cx="44" cy="126" rx="15" ry="33" fill={fill} transform="rotate(22 44 126)" />
      <ellipse cx="156" cy="126" rx="15" ry="33" fill={fill} transform="rotate(-22 156 126)" />
      <ellipse cx="100" cy="116" rx="60" ry="68" fill={fill} />
      {stage === 1 && <path d="M96 52C88 40 104 34 100 22C114 34 112 46 106 54Z" fill="#aab4c2" />}
      <ellipse cx="100" cy="134" rx="41" ry="46" fill="url(#pg-belly)" />
      <ellipse cx="100" cy="94" rx="45" ry="31" fill="url(#pg-belly)" />
      <Eyes />
      <ellipse cx="66" cy="108" rx="10" ry="6" fill={CHEEK} opacity=".9" />
      <ellipse cx="134" cy="108" rx="10" ry="6" fill={CHEEK} opacity=".9" />
      <path d="M90 102Q100 98 110 102L100 114Z" fill="url(#pg-beak)" />
      <ellipse cx="78" cy="62" rx="18" ry="8" fill="#fff" opacity=".35" />

      {stage >= 3 && !neck && (
        <>
          <path d="M58 122C80 134 120 134 142 122L142 136C120 148 80 148 58 136Z" fill="url(#g-coral)" />
          <path d="M118 138L134 166L116 162Z" fill="#e8684a" />
        </>
      )}
      {stage === 4 && !face && (
        <>
          <circle cx="83" cy="92" r="13" fill="none" stroke={EYE} strokeWidth="3" />
          <circle cx="117" cy="92" r="13" fill="none" stroke={EYE} strokeWidth="3" />
          <path d="M96 92H104" stroke={EYE} strokeWidth="3" />
        </>
      )}
      {stage === 4 && !hat && (
        <>
          <path d="M72 58V70C86 78 114 78 128 70V58L100 68Z" fill="#3a3f55" />
          <path d="M46 48L100 26L154 48L100 68Z" fill="#3a3f55" />
          <path d="M100 47L146 60V80" stroke="#ffc94d" strokeWidth="3" fill="none" />
          <circle cx="146" cy="82" r="5" fill="#ffc94d" />
        </>
      )}
      {neck?.art}
      {face?.art}
      {hat?.art}
    </g>
  );
}

export function Penguin({
  stage,
  size = 160,
  outfit = {},
  className,
}: {
  stage: GrowthStage['index'];
  size?: number;
  outfit?: Partial<Record<OutfitSlot, string>>;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={GROWTH_STAGES[stage].name}
      className={className}
    >
      <ellipse cx="100" cy="189" rx="48" ry="7" fill="rgba(90,60,40,0.16)" />
      {stage === 0 ? <Egg /> : <Body stage={stage} outfit={outfit} />}
    </svg>
  );
}
