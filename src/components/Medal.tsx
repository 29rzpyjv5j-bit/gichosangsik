import { BADGE_GRADIENT, type BadgeGroup } from '../data/badges';

export function Medal({
  emoji, group, earned, size = 62,
}: {
  emoji: string;
  group: BadgeGroup;
  earned: boolean;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        margin: '0 auto',
        background: earned ? BADGE_GRADIENT[group] : 'var(--surface)',
        border: earned ? 'none' : '2px dashed var(--border)',
        filter: earned ? 'none' : 'grayscale(1)',
        opacity: earned ? 1 : 0.55,
        boxShadow: earned ? '0 3px 0 rgba(0,0,0,.14)' : 'none',
      }}
    >
      {emoji}
    </div>
  );
}
