import { normalizeContactPhone } from './projectInquiryFormat';
import { deleteDemoInterest, readDemoInterest, writeDemoInterest } from './demoInterestStorage';

export type PropertyInterest = {
  propertyId: string;
  contactName: string;
  contactPhone: string;
  kind: 'info' | 'visit';
  createdAt: string;
};

const keyFor = (propertyId: string) => `huni.demo-property-interest.${propertyId}`;

export async function savePropertyInterest(details: Omit<PropertyInterest, 'createdAt'>): Promise<PropertyInterest> {
  const contactName = details.contactName.trim();
  const contactPhone = normalizeContactPhone(details.contactPhone);
  if (contactName.length < 2 || contactName.length > 100) throw new Error('Masukkan nama lengkap.');
  if (!contactPhone) throw new Error('Masukkan nomor WhatsApp yang valid.');
  const saved = { ...details, contactName, contactPhone, createdAt: new Date().toISOString() };
  await writeDemoInterest(keyFor(details.propertyId), JSON.stringify(saved));
  return saved;
}

export async function getPropertyInterest(propertyId: string): Promise<PropertyInterest | null> {
  const raw = await readDemoInterest(keyFor(propertyId));
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as PropertyInterest;
    return value.propertyId === propertyId && typeof value.contactName === 'string' &&
      typeof value.contactPhone === 'string' && ['info', 'visit'].includes(value.kind) &&
      typeof value.createdAt === 'string' ? value : null;
  } catch {
    return null;
  }
}

export async function clearPropertyInterest(propertyId: string): Promise<void> {
  await deleteDemoInterest(keyFor(propertyId));
}
