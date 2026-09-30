import { describe, expect, it } from 'vitest';
import { normalizeContactPhone, parseProjectInquiry } from '../src/lib/projectInquiryFormat';

describe('project inquiry contact details', () => {
  it('accepts Indonesian mobile numbers and rejects incomplete or malformed numbers', () => {
    expect(normalizeContactPhone('0812 3456 7890')).toBe('+6281234567890');
    expect(normalizeContactPhone('+62 812-3456-7890')).toBe('+6281234567890');
    expect(normalizeContactPhone('123')).toBeNull();
    expect(normalizeContactPhone('0812abc')).toBeNull();
  });

  it('ignores other lead notes instead of displaying them as buyer inquiries', () => {
    const row = { id: 'lead-1', project_id: 'project-1', created_at: '2026-09-30T00:00:00Z', note: 'ordinary lead note' };
    expect(parseProjectInquiry(row)).toBeNull();
    expect(parseProjectInquiry({ ...row, note: JSON.stringify({ version: 1, unitName: 'Aster', kind: 'visit', contactName: 'Ayu', contactPhone: '+6281234567890' }) })).toMatchObject({ unitName: 'Aster', kind: 'visit', contactName: 'Ayu' });
  });
});
