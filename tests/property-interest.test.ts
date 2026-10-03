import { beforeEach, describe, expect, it, vi } from 'vitest';

const values = vi.hoisted(() => new Map<string, string>());

vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
    removeItem: async (key: string) => { values.delete(key); },
  },
}));

import { clearPropertyInterest, getPropertyInterest, savePropertyInterest } from '../src/lib/propertyInterest';

beforeEach(() => values.clear());

describe('property interest demo', () => {
  it('normalizes contact details, restores them for the same property, and lets the buyer erase them', async () => {
    const saved = await savePropertyInterest({ propertyId: 'home-1', contactName: '  Ayu  ', contactPhone: '0812 3456 7890', kind: 'visit' });
    expect(saved).toMatchObject({ contactName: 'Ayu', contactPhone: '+6281234567890', kind: 'visit' });
    expect(await getPropertyInterest('home-1')).toMatchObject(saved);
    expect(await getPropertyInterest('home-2')).toBeNull();
    await clearPropertyInterest('home-1');
    expect(await getPropertyInterest('home-1')).toBeNull();
  });

  it('rejects invalid contact details before storing them', async () => {
    await expect(savePropertyInterest({ propertyId: 'home-1', contactName: 'A', contactPhone: '081234567890', kind: 'info' })).rejects.toThrow('nama');
    await expect(savePropertyInterest({ propertyId: 'home-1', contactName: 'Ayu', contactPhone: '123', kind: 'info' })).rejects.toThrow('WhatsApp');
    expect(values.size).toBe(0);
  });
});
