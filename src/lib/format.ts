export function formatIDR(value: number): string {
  if (value >= 1_000_000_000) {
    const b = value / 1_000_000_000;
    return `Rp ${trimZero(b)} M`;
  }
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `Rp ${trimZero(m)} jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function trimZero(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
}

/** Grouped-thousands digits for an editable amount input, e.g. "1.500.000.000" — no Rp/M/jt abbreviation. */
export function formatDigits(value: string): string {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatPriceLine(price: number, unit: 'total' | 'month' | 'year'): string {
  const base = formatIDR(price);
  if (unit === 'month') return `${base}/bulan`;
  if (unit === 'year') return `${base}/tahun`;
  return base;
}
