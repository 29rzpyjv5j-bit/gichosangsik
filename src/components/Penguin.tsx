import { GROWTH_STAGES, type GrowthStage } from '../domain/growth';

const NAVY = '#2b3a55';
const BELLY = '#f7f4ee';
const BEAK = '#ffb347';
const CHEEK = '#ffb3b3';
const EYE = '#1e2433';

function Eyes() {
  return (
    <>
      <circle cx="84" cy="92" r="7" fill={EYE} />
      <circle cx="116" cy="92" r="7" fill={EYE} />
      <circle cx="86.5" cy="89.5" r="2.4" fill="#fff" />
      <circle cx="118.5" cy="89.5" r="2.4" fill="#fff" />
    </>
  );
}

function Egg() {
  return (
    <g>
      <path
        d="M100 28 C150 28 166 108 166 136 C166 170 138 186 100 186 C62 186 34 170 34 136 C34 108 50 28 100 28 Z"
        fill="#fff8ec"
        stroke="#f0dfc4"
        strokeWidth="3"
      />
      <path d="M56 78 C70 34 130 34 144 78 L130 90 L116 74 L100 92 L84 74 L70 90 Z" fill={NAVY} />
      <circle cx="84" cy="118" r="6.5" fill={EYE} />
      <circle cx="116" cy="118" r="6.5" fill={EYE} />
      <circle cx="86" cy="116" r="2.2" fill="#fff" />
      <circle cx="118" cy="116" r="2.2" fill="#fff" />
      <ellipse cx="72" cy="134" rx="8" ry="5" fill={CHEEK} />
      <ellipse cx="128" cy="134" rx="8" ry="5" fill={CHEEK} />
      <path d="M94 128 L106 128 L100 136 Z" fill={BEAK} />
    </g>
  );
}

function Body({ stage }: { stage: 1 | 2 | 3 | 4 }) {
  const color = stage === 1 ? '#9aa7b8' : NAVY;
  const face = stage === 1 ? '#e9eef4' : BELLY;
  const scale = [0, 0.72, 0.84, 0.95, 1][stage];
  return (
    <g transform={`translate(100 184) scale(${scale}) translate(-100 -184)`}>
      <ellipse cx="82" cy="180" rx="14" ry="7" fill={BEAK} />
      <ellipse cx="118" cy="180" rx="14" ry="7" fill={BEAK} />
      <ellipse cx="46" cy="124" rx="14" ry="34" fill={color} transform="rotate(20 46 124)" />
      <ellipse cx="154" cy="124" rx="14" ry="34" fill={color} transform="rotate(-20 154 124)" />
      <ellipse cx="100" cy="118" rx="58" ry="66" fill={color} />
      <ellipse cx="100" cy="134" rx="40" ry="46" fill={BELLY} />
      <ellipse cx="100" cy="96" rx="44" ry="30" fill={face} />
      {stage === 1 && (
        <path d="M96 54 C90 42 104 38 100 28 C112 38 110 48 106 55 Z" fill={color} />
      )}
      <Eyes />
      <ellipse cx="70" cy="106" rx="8" ry="5" fill={CHEEK} />
      <ellipse cx="130" cy="106" rx="8" ry="5" fill={CHEEK} />
      <path d="M92 102 L108 102 L100 112 Z" fill={BEAK} />
      {stage >= 3 && (
        <>
          <path d="M58 124 C80 136 120 136 142 124 L142 136 C120 148 80 148 58 136 Z" fill="#ff6b6b" />
          <path d="M120 138 L136 166 L118 162 Z" fill="#ff6b6b" />
        </>
      )}
      {stage === 4 && (
        <>
          <circle cx="84" cy="92" r="12" fill="none" stroke={EYE} strokeWidth="3" />
          <circle cx="116" cy="92" r="12" fill="none" stroke={EYE} strokeWidth="3" />
          <path d="M96 92 L104 92" stroke={EYE} strokeWidth="3" />
          <path d="M72 58 L72 70 C86 78 114 78 128 70 L128 58 L100 68 Z" fill="#23283a" />
          <path d="M46 48 L100 26 L154 48 L100 68 Z" fill="#23283a" />
          <path d="M100 47 L146 60 L146 80" stroke="#ffc93c" strokeWidth="3" fill="none" />
          <circle cx="146" cy="82" r="5" fill="#ffc93c" />
        </>
      )}
    </g>
  );
}

export function Penguin({
  stage,
  size = 160,
  className,
}: {
  stage: GrowthStage['index'];
  size?: number;
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
      <ellipse cx="100" cy="188" rx="50" ry="7" fill="rgba(0,0,0,0.10)" />
      {stage === 0 ? <Egg /> : <Body stage={stage} />}
    </svg>
  );
}
