import * as Localization from 'expo-localization';
import { useAppStore, type Language } from '../store/useAppStore';

/**
 * Minimal id/en dictionary. Only screens that call t() are translated —
 * most of the app is still Indonesian-only strings inline (see
 * docs/feature-gaps.md, "Lokalisasi"). This covers the Settings screen
 * and shared chrome as the first slice, not a full-app audit.
 */
const strings = {
  settingsTitle: { id: 'Tampilan', en: 'Appearance' },
  glassSectionTitle: { id: 'Intensitas kaca', en: 'Glass intensity' },
  glassSectionHint: {
    id: 'Atur seberapa tembus pandang navigasi dan panel mengambang.',
    en: 'Control how translucent floating navigation and panels look.',
  },
  glassLow: { id: 'Rendah', en: 'Low' },
  glassMedium: { id: 'Sedang', en: 'Medium' },
  glassHigh: { id: 'Tinggi', en: 'High' },
  reduceTransparencyNotice: {
    id: 'Reduce Transparency aktif di perangkatmu — kaca ditampilkan sebagai permukaan solid.',
    en: 'Reduce Transparency is on for this device — glass renders as a solid surface instead.',
  },
  languageSectionTitle: { id: 'Bahasa', en: 'Language' },
  languageSectionHint: {
    id: 'Pilih bahasa aplikasi. "Ikuti perangkat" memakai bahasa sistem.',
    en: 'Choose the app language. "Follow device" uses your system language.',
  },
  languageSystem: { id: 'Ikuti perangkat', en: 'Follow device' },
  languageId: { id: 'Bahasa Indonesia', en: 'Indonesian' },
  languageEn: { id: 'English', en: 'English' },
  back: { id: 'Kembali', en: 'Back' },
} as const;

export type StringKey = keyof typeof strings;

export function resolveLanguage(preference: Language): 'id' | 'en' {
  if (preference !== 'system') return preference;
  const deviceTag = Localization.getLocales()[0]?.languageCode ?? 'id';
  return deviceTag === 'en' ? 'en' : 'id';
}

export function useLanguage(): 'id' | 'en' {
  const preference = useAppStore((s) => s.language);
  return resolveLanguage(preference);
}

export function useTranslate() {
  const lang = useLanguage();
  return (key: StringKey) => strings[key][lang];
}
