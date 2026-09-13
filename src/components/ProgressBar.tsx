export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      style={{
        height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden',
      }}
    >
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)' }} />
    </div>
  );
}
