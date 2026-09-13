import { render, screen } from '@testing-library/react';
import { formatMoney, Money } from './Money';

test('천 단위 쉼표와 원 단위를 붙인다', () => {
  expect(formatMoney(0)).toBe('0원');
  expect(formatMoney(7500)).toBe('7,500원');
  expect(formatMoney(1_024_000)).toBe('1,024,000원');
});

test('Money 컴포넌트가 금액을 그린다', () => {
  render(<Money value={95000} />);
  expect(screen.getByText('95,000원')).toBeInTheDocument();
});
