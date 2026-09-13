export function formatMoney(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

export function Money({ value }: { value: number }) {
  return <span>{formatMoney(value)}</span>;
}
