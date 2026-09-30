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

  // Shared / common
  retry: { id: 'Coba lagi', en: 'Retry' },
  cancel: { id: 'Batal', en: 'Cancel' },
  save: { id: 'Simpan', en: 'Save' },
  send: { id: 'Kirim', en: 'Send' },
  delete: { id: 'Hapus', en: 'Delete' },
  loading: { id: 'Memuat…', en: 'Loading…' },
  seeAll: { id: 'Lihat semua', en: 'See all' },

  // Tab bar
  tabHome: { id: 'Beranda', en: 'Home' },
  tabExplore: { id: 'Explore', en: 'Explore' },
  tabSaved: { id: 'Tersimpan', en: 'Saved' },
  tabProfile: { id: 'Profil', en: 'Profile' },

  // Home
  greetingMorning: { id: 'Selamat pagi', en: 'Good morning' },
  greetingAfternoon: { id: 'Selamat siang', en: 'Good afternoon' },
  greetingEvening: { id: 'Selamat sore', en: 'Good evening' },
  greetingNight: { id: 'Selamat malam', en: 'Good evening' },
  homeIntroTitle: { id: 'Ruang untuk hidupmu.', en: 'A space for your life.' },
  homeIntroSubtitle: { id: 'Temukan tempat yang terasa tepat.', en: 'Find the place that feels right.' },
  homeSearchPlaceholder: { id: 'Cari area atau ceritakan kebutuhanmu', en: 'Search an area or describe what you need' },
  intentBuy: { id: 'Beli', en: 'Buy' },
  intentRent: { id: 'Sewa', en: 'Rent' },
  intentNewProjects: { id: 'Proyek Baru', en: 'New Projects' },
  allAreas: { id: 'Semua area', en: 'All areas' },
  recommendedForYou: { id: 'Pilihan untukmu', en: 'Recommended for you' },
  projectsToExplore: { id: 'Proyek untuk dijelajahi', en: 'Projects to explore' },
  kprBannerBuyTitle: { id: 'Cek keterjangkauan KPR', en: 'Check your mortgage affordability' },
  kprBannerBuySubtitle: { id: 'Cari berdasarkan cicilan bulanan yang nyaman untukmu', en: 'Search by a monthly installment that fits you' },
  kprBannerRentTitle: { id: 'Cari sewa sesuai anggaran', en: 'Find a rental within budget' },
  kprBannerRentSubtitle: { id: 'Bandingkan biaya bulanan dan tempat yang pas', en: 'Compare monthly cost and find the right fit' },
  continueExploring: { id: 'Lanjut jelajahi', en: 'Keep exploring' },
  otherOptionsToCompare: { id: 'Pilihan lain untuk dibandingkan', en: 'More options to compare' },
  exploreAreas: { id: 'Jelajahi area', en: 'Explore areas' },
  areasWithAvailableProperties: { id: 'Area dengan properti yang tersedia', en: 'Areas with available properties' },
  newProjects: { id: 'Proyek baru', en: 'New projects' },
  fromVerifiedDevelopers: { id: 'Dari developer resmi terverifikasi', en: 'From verified official developers' },
  newProjectBadge: { id: 'PROYEK BARU', en: 'NEW PROJECT' },
  percentComplete: { id: 'SELESAI', en: 'COMPLETE' },
  startingFrom: { id: 'mulai', en: 'from' },
  unitPriceUnavailable: { id: 'Harga unit belum tersedia', en: 'Unit price not yet available' },
  welcomeGuest: { id: 'selamat datang', en: 'welcome' },
  workspaceNotSynced: { id: 'Workspace belum tersinkron', en: 'Workspace not synced' },
  catalogLoadError: { id: 'Katalog belum dapat dimuat. Periksa koneksi lalu coba lagi.', en: 'Could not load the catalog. Check your connection and try again.' },
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
