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

/**
 * Uses the pure-JS Intl API rather than expo-localization — that native
 * module isn't present in every Expo Go build, and it threw at import
 * time (crashing the whole app before render). Intl.DateTimeFormat has
 * no native dependency and works identically in Expo Go, a dev build,
 * and production.
 */
export function resolveLanguage(preference: Language): 'id' | 'en' {
  if (preference !== 'system') return preference;
  try {
    const deviceTag = Intl.DateTimeFormat().resolvedOptions().locale ?? 'id';
    return deviceTag.toLowerCase().startsWith('en') ? 'en' : 'id';
  } catch {
    return 'id';
  }
}

export function useLanguage(): 'id' | 'en' {
  const preference = useAppStore((s) => s.language);
  return resolveLanguage(preference);
}

export function useTranslate() {
  const lang = useLanguage();
  return (key: StringKey) => strings[key][lang];
}
