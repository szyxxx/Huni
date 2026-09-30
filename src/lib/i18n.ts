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

  // Explore (search.tsx)
  exploreEyebrow: { id: 'JELAJAHI HUNI', en: 'EXPLORE HUNI' },
  exploreTitle: { id: 'Cari dengan caramu.', en: 'Search your way.' },
  exploreSearchPlaceholder: { id: 'Area, rumah, atau kebutuhanmu...', en: 'Area, home, or what you need...' },
  askAi: { id: 'Tanya AI', en: 'Ask AI' },
  openFilters: { id: 'Buka filter', en: 'Open filters' },
  showMap: { id: 'Tampilkan peta', en: 'Show map' },
  showList: { id: 'Tampilkan daftar', en: 'Show list' },
  entityArea: { id: 'Area', en: 'Area' },
  entityCity: { id: 'Kota', en: 'City' },
  recentSearches: { id: 'PENCARIAN TERAKHIR', en: 'RECENT SEARCHES' },
  clear: { id: 'Hapus', en: 'Clear' },
  describePlaceTitle: { id: 'Ceritakan tempat yang kamu cari', en: 'Describe the place you’re looking for' },
  describePlaceHint: {
    id: 'Tulis lokasi, jumlah kamar, atau batas cicilan. Kami akan merangkum kebutuhanmu menjadi filter.',
    en: 'Write a location, room count, or installment limit. We’ll turn it into filters.',
  },
  describePlaceExample: { id: '“Rumah 3 kamar dekat ITB cicilan 8 juta”', en: '“3-bedroom house near ITB, 8 million installment”' },
  yourSearch: { id: 'Pencarianmu:', en: 'Your search:' },
  savedSearchDefaultLabel: { id: 'Pencarian tanpa judul', en: 'Untitled search' },
  searchSavedToast: { id: 'Pencarian disimpan di workspace kamu.', en: 'Search saved to your workspace.' },
  searchSavedTitle: { id: 'Pencarian tersimpan', en: 'Search saved' },
  saveSearch: { id: 'Simpan pencarian', en: 'Save search' },
  projectsFound: { id: 'proyek ditemukan', en: 'projects found' },
  propertiesFound: { id: 'properti ditemukan', en: 'properties found' },
  projectsLoadError: { id: 'Proyek belum dapat dimuat. Tarik ke bawah untuk mencoba lagi.', en: 'Could not load projects. Pull down to try again.' },
  noMatchingProjects: { id: 'Belum ada proyek yang cocok. Coba area atau nama lain.', en: 'No matching projects yet. Try another area or name.' },
  unitTypeCount: { id: 'tipe unit', en: 'unit types' },
  noResultsOnMap: { id: 'Belum ada hasil di peta', en: 'No results on the map yet' },
  noResultsOnMapHint: { id: 'Perlebar pencarian atau ubah filter untuk melihat area lain.', en: 'Widen your search or change filters to see other areas.' },
  seeAllProperties: { id: 'Lihat semua properti', en: 'See all properties' },
  openPreview: { id: 'Buka', en: 'Open' },
  closePreview: { id: 'Tutup pratinjau', en: 'Close preview' },
  loadPropertiesError: { id: 'Gagal memuat properti', en: 'Failed to load properties' },
  noResults: { id: 'Tidak ada hasil', en: 'No results' },
  checkConnectionRetry: { id: 'Periksa koneksi internetmu, lalu tarik ke bawah untuk mencoba lagi.', en: 'Check your internet connection, then pull down to try again.' },
  tryOtherKeywordOrArea: { id: 'Coba ubah kata kunci atau perlebar area pencarian.', en: 'Try a different keyword or widen the search area.' },
  sortRecommendation: { id: 'Rekomendasi', en: 'Recommended' },
  sortNewest: { id: 'Terbaru', en: 'Newest' },
  sortPriceLow: { id: 'Harga terendah', en: 'Lowest price' },
  sortPriceHigh: { id: 'Harga tertinggi', en: 'Highest price' },
  sortLargestArea: { id: 'Luas terbesar', en: 'Largest area' },

  // Property detail
  propertyLoadError: { id: 'Properti belum dapat dimuat.', en: 'Could not load this property.' },
  propertyNotFound: { id: 'Properti tidak ditemukan.', en: 'Property not found.' },
  watchingPrice: { id: 'Memantau harga', en: 'Watching price' },
  watchPrice: { id: 'Pantau harga', en: 'Watch price' },
  shortlist: { id: 'Shortlist', en: 'Shortlist' },
  scheduleTour: { id: 'Jadwalkan tur', en: 'Schedule tour' },
  video: { id: 'Video', en: 'Video' },
  virtualTourBeta: { id: 'Tur virtual · Beta', en: 'Virtual tour · Beta' },
  noShortlistYet: { id: 'Belum ada shortlist. Buat dari tab Tersimpan.', en: 'No shortlists yet. Create one from the Saved tab.' },
  addedCheck: { id: 'Ditambahkan ✓', en: 'Added ✓' },
  propertiesCount: { id: 'properti', en: 'properties' },
  pickDay: { id: 'Pilih hari', en: 'Pick a day' },
  pickTime: { id: 'Pilih waktu', en: 'Pick a time' },
  sendTourRequest: { id: 'Kirim permintaan tur', en: 'Send tour request' },
  minutesUnit: { id: 'menit', en: 'min' },
  fromPrefix: { id: 'dari', en: 'from' },
  estimatedInstallmentPerMonth: { id: 'Estimasi cicilan', en: 'Estimated installment' },
  perMonthSuffix: { id: '/bulan', en: '/mo' },
  whyThisFits: { id: 'Mengapa ini mungkin cocok untukmu', en: 'Why this might fit you' },
  bedroomsLabel: { id: 'Kamar tidur', en: 'Bedrooms' },
  bathroomsLabel: { id: 'Kamar mandi', en: 'Bathrooms' },
  landAreaLabel: { id: 'Luas tanah', en: 'Land area' },
  buildingAreaLabel: { id: 'Luas bangunan', en: 'Building area' },
  viewPhoto: { id: 'Lihat foto', en: 'View photo' },
  aboutProperty: { id: 'Tentang properti', en: 'About this property' },
  facilities: { id: 'Fasilitas', en: 'Facilities' },
  location: { id: 'Lokasi', en: 'Location' },
  locationHiddenUntilVerified: { id: 'Peta lokasi tersembunyi sampai iklan ini diverifikasi', en: 'Map location hidden until this listing is verified' },
  nearbyPlacesHint: {
    id: 'Ikon taman, minimarket, mall, tempat makan, dan sekolah muncul saat peta di-zoom cukup dekat.',
    en: 'Park, minimarket, mall, food, and school icons appear once the map is zoomed in close enough.',
  },
  listedBy: { id: 'Diiklankan oleh', en: 'Listed by' },
  agencyLabel: { id: 'Agensi properti', en: 'Property agency' },
  directOwnerLabel: { id: 'Pemilik langsung', en: 'Direct owner' },
  lastConfirmedPrefix: { id: 'Terakhir dikonfirmasi', en: 'Last confirmed' },
  viewProfile: { id: 'Lihat profil', en: 'View profile' },
  reportListingAction: { id: 'Laporkan iklan ini', en: 'Report this listing' },
  similarProperties: { id: 'Properti serupa', en: 'Similar properties' },
  priceLabel: { id: 'Harga', en: 'Price' },
  contactViaWhatsApp: { id: 'Hubungi via WhatsApp', en: 'Contact via WhatsApp' },
  viewSaved: { id: 'Lihat tersimpan', en: 'View saved' },
  saveForLater: { id: 'Simpan untuk nanti', en: 'Save for later' },
  priceDropBadge: { id: 'HARGA TURUN', en: 'PRICE DROP' },
  tourRequestSentTitle: { id: 'Permintaan tur terkirim', en: 'Tour request sent' },
  tourRequestSentBody: { id: 'Kami akan meneruskan permintaanmu ke pengiklan.', en: 'We’ll pass your request on to the advertiser.' },
  reportNotAvailableDemo: { id: 'Pelaporan belum tersedia di mode demo.', en: 'Reporting isn’t available in demo mode.' },
  notAvailableTitle: { id: 'Belum tersedia', en: 'Not available' },
  reportSendFailedTitle: { id: 'Gagal mengirim laporan', en: 'Failed to send report' },
  reportReceivedTitle: { id: 'Laporan diterima', en: 'Report received' },
  reportReceivedBody: { id: 'Tim kami akan meninjau iklan ini.', en: 'Our team will review this listing.' },
  reportConfirmMsg: { id: 'Laporkan iklan ini karena tidak akurat, sudah terjual, atau melanggar aturan?', en: 'Report this listing as inaccurate, already sold, or against the rules?' },
  reportDialogTitle: { id: 'Laporkan iklan', en: 'Report listing' },
  reportAction: { id: 'Laporkan', en: 'Report' },
  dayToday: { id: 'Hari ini', en: 'Today' },
  dayTomorrow: { id: 'Besok', en: 'Tomorrow' },
  dayAfterTomorrow: { id: 'Lusa', en: 'In 2 days' },
  slotMorning: { id: 'Pagi (09.00)', en: 'Morning (9:00)' },
  slotNoon: { id: 'Siang (12.00)', en: 'Noon (12:00)' },
  slotAfternoon: { id: 'Sore (15.00)', en: 'Afternoon (15:00)' },
  slotEvening: { id: 'Malam (18.00)', en: 'Evening (18:00)' },

  // Fit reasons (recommendations.ts)
  fitBudgetKpr: { id: 'Sesuai anggaran cicilan bulanan dari simulasi KPR-mu', en: 'Fits the monthly installment budget from your mortgage simulation' },
  fitBudgetFilter: { id: 'Dalam batas cicilan maksimum yang kamu tetapkan', en: 'Within the maximum installment you set' },
  fitBedroomsPrefix: { id: 'Sesuai preferensi', en: 'Matches your' },
  fitBedroomsSuffix: { id: 'kamar tidur', en: '+ bedroom preference' },
  fitTypeMatch: { id: 'Tipe properti sesuai pencarianmu', en: 'Property type matches your search' },
  fitVerifiedAdvertiser: { id: 'Diiklankan oleh pihak terverifikasi', en: 'Listed by a verified party' },

  // PropertyCard
  hidePropertyConfirmSuffix: {
    id: '? Properti ini tidak akan muncul lagi di hasil pencarian. Kamu bisa menampilkannya lagi dari tab Tersimpan.',
    en: '? This property will no longer appear in search results. You can unhide it from the Saved tab.',
  },
  hidePropertyConfirmPrefix: { id: 'Sembunyikan', en: 'Hide' },
  hidePropertyTitle: { id: 'Sembunyikan properti', en: 'Hide property' },
  hideAction: { id: 'Sembunyikan', en: 'Hide' },
  removeFromSaved: { id: 'Hapus dari tersimpan', en: 'Remove from saved' },
  saveProperty: { id: 'Simpan properti', en: 'Save property' },
  sponsoredBadge: { id: 'DISPONSORI', en: 'SPONSORED' },
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
