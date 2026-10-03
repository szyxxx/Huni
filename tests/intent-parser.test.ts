import { describe, expect, it } from 'vitest';
import { parseIntentQuery } from '../src/lib/intentParser';

describe('natural-language property search', () => {
  it('reads the featured example without folding the budget into the landmark', () => {
    const parsed = parseIntentQuery('Rumah 3 kamar dekat kampus, cicilan di bawah 8 juta');
    expect(parsed).toMatchObject({ type: 'house', bedrooms: 3, location: 'kampus', maxInstallment: 8_000_000 });
  });

  it('understands an explicit price ceiling', () => {
    const parsed = parseIntentQuery('Rumah dekat BSD City harga di bawah 2 miliar');
    expect(parsed).toMatchObject({ type: 'house', location: 'BSD City', maxPrice: 2_000_000_000 });
  });
});
