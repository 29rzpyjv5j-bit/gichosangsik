import type { ReactNode } from 'react';

export function ThickButton({
  children, onClick, accent = false, disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={accent ? 'thick-accent' : 'thick'}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
