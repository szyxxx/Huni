export type InquiryKind = 'availability' | 'brochure' | 'visit';

export type ProjectInquiry = {
  id: string;
  projectId: string;
  createdAt: string;
  unitName: string;
  kind: InquiryKind;
  contactName: string;
  contactPhone: string;
};

export function normalizeContactPhone(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, '');
  const normalized = compact.startsWith('0') ? `+62${compact.slice(1)}` : compact.startsWith('62') ? `+${compact}` : compact;
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

export function parseProjectInquiry(row: { id: string; project_id: string; created_at: string; note: string | null }): ProjectInquiry | null {
  try {
    const note = JSON.parse(row.note ?? '');
    if (note.version !== 1 || typeof note.unitName !== 'string' || !['availability', 'brochure', 'visit'].includes(note.kind) || typeof note.contactName !== 'string' || typeof note.contactPhone !== 'string') return null;
    return { id: row.id, projectId: row.project_id, createdAt: row.created_at, unitName: note.unitName, kind: note.kind, contactName: note.contactName, contactPhone: note.contactPhone };
  } catch {
    return null;
  }
}
