import { BADGE_GRADIENT, type BadgeGroup } from '../data/badges';
import type { CategoryId } from '../types';
import { Icon, Landmark, type IconName } from './Icons';

function badgeArt(id: string, group: BadgeGroup, size: number) {
  if (group === 'category') return <Landmark category={id.replace('master-', '') as CategoryId} size={size} />;
  let name: IconName = 'medal';
  if (group === 'tier') name = id.endsWith('basic') ? 'sprout' : id.endsWith('mid') ? 'tree' : 'mount';
  else if (group === 'perfect') name = 'star';
  else if (group === 'wrong') name = id.includes('empty') ? 'broom' : 'book';
  else if (group === 'daily') name = 'dice';
  return <Icon name={name} size={size} />;
}

export function Medal({
  id, group, earned, size = 62,
}: {
  id: string;
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
        margin: '0 auto',
        background: earned ? BADGE_GRADIENT[group] : 'var(--surface)',
        border: earned ? 'none' : '2px dashed var(--border)',
        filter: earned ? 'none' : 'grayscale(1)',
        opacity: earned ? 1 : 0.55,
        boxShadow: earned ? 'inset 0 3px 0 rgba(255,255,255,.5), 0 4px 10px rgba(160,110,80,.25)' : 'none',
      }}
    >
      {badgeArt(id, group, size * 0.62)}
    </div>
  );
}
