import { useCallback } from 'react';
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
  exploreSearchPlaceholder: { id: 'Cari lokasi...', en: 'Search area...' },
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

  // Saved
  yourDecisions: { id: 'Keputusanmu', en: 'Your decisions' },
  savedIntro: { id: 'Simpan tempat yang menarik, lalu bandingkan dengan tenang.', en: 'Save places you like, then compare them calmly.' },
  nextStepEyebrow: { id: 'LANGKAH BERIKUTNYA', en: 'NEXT STEP' },
  compareSelectedProperties: { id: 'Bandingkan {n} properti pilihan', en: 'Compare {n} selected properties' },
  findComparisonForPicks: { id: 'Cari pembanding untuk pilihanmu', en: 'Find something to compare your picks with' },
  startWithLikedProperty: { id: 'Mulai dari properti yang kamu suka', en: 'Start with a property you like' },
  propertiesTab: { id: 'Properti', en: 'Properties' },
  plansAndCollections: { id: 'Rencana & koleksi', en: 'Plans & collections' },
  savedProperties: { id: 'Properti tersimpan', en: 'Saved properties' },
  savePlansHint: { id: 'Simpan hal penting untuk keputusan berikutnya', en: 'Save what matters for your next decision' },
  savedPropertiesLoadError: { id: 'Properti tersimpan belum dapat dimuat. Periksa koneksi lalu coba lagi.', en: 'Could not load saved properties. Check your connection and try again.' },
  noSavedPropertiesYet: { id: 'Belum ada properti tersimpan. Temukan tempat yang ingin kamu pertimbangkan.', en: 'No saved properties yet. Find a place you want to consider.' },
  exploreProperties: { id: 'Jelajahi properti', en: 'Explore properties' },
  recentlyViewed: { id: 'Baru dilihat', en: 'Recently viewed' },
  priceDrops: { id: 'Harga turun', en: 'Price drops' },
  propertiesYouWatch: { id: 'properti yang kamu pantau', en: 'properties you’re watching' },
  collections: { id: 'koleksi', en: 'collections' },
  newShortlistPlaceholder: { id: 'Nama shortlist baru', en: 'New shortlist name' },
  create: { id: 'Buat', en: 'Create' },
  createShortlistLabel: { id: 'Buat shortlist', en: 'Create shortlist' },
  shareable: { id: 'bisa dibagikan', en: 'shareable' },
  savedSearchesCount: { id: 'pencarian', en: 'searches' },
  noSavedSearchesHint: { id: 'Simpan pencarian dari layar Cari untuk menggunakannya lagi nanti.', en: 'Save a search from Explore to use it again later.' },
  savedSearchLabel: { id: 'Pencarian tersimpan', en: 'Saved search' },
  open: { id: 'Buka', en: 'Open' },
  removeSavedSearchLabel: { id: 'Hapus pencarian', en: 'Remove search' },
  hidden: { id: 'Disembunyikan', en: 'Hidden' },
  show: { id: 'Tampilkan', en: 'Show' },
  kprSimulations: { id: 'Simulasi KPR', en: 'Mortgage simulations' },
  scenariosSaved: { id: 'skenario tersimpan', en: 'saved scenarios' },
  saveKprHint: { id: 'Simpan hasil simulasi KPR untuk membandingkannya nanti.', en: 'Save a mortgage simulation to compare later.' },
  dpAbbrev: { id: 'DP', en: 'DP' },
  yearsAbbrev: { id: 'thn', en: 'yr' },
  shortlistCreatedTitle: { id: 'Shortlist dibuat', en: 'Shortlist created' },
  shortlistCreatedBody: { id: '"{name}" siap ditambahi properti dan dibagikan.', en: '"{name}" is ready to add properties to and share.' },
  savedSearchesTitle: { id: 'Pencarian tersimpan', en: 'Saved searches' },

  // Profile
  profileTitle: { id: 'Profil', en: 'Profile' },
  guestLabel: { id: 'Tamu', en: 'Guest' },
  prefsSyncedAllDevices: { id: 'Preferensi tersimpan di semua perangkat', en: 'Preferences synced across all devices' },
  signInToSync: { id: 'Masuk untuk menyinkronkan pilihanmu', en: 'Sign in to sync your choices' },
  savedOnThisDevice: { id: 'Pilihan tersimpan di perangkat ini', en: 'Choices saved on this device' },
  signOutFailedMessage: { id: 'Sesi lokal sudah dibersihkan, tetapi keluar dari server gagal. Coba lagi saat terhubung.', en: 'Local session cleared, but signing out from the server failed. Try again when connected.' },
  signOutIncompleteTitle: { id: 'Keluar belum selesai', en: 'Sign out incomplete' },
  signOut: { id: 'Keluar', en: 'Sign out' },
  signInOrRegister: { id: 'Masuk / Daftar', en: 'Sign in / Register' },
  menuActivity: { id: 'Aktivitas', en: 'Activity' },
  menuAccountPrivacy: { id: 'Akun & privasi', en: 'Account & privacy' },
  menuSaved: { id: 'Tersimpan', en: 'Saved' },
  menuSavedHint: { id: 'Properti, pencarian, dan shortlist', en: 'Properties, searches, and shortlists' },
  menuKprSim: { id: 'Simulasi KPR', en: 'Mortgage simulator' },
  menuKprSimHint: { id: 'Rencanakan cicilan yang nyaman', en: 'Plan a comfortable installment' },
  menuAppearance: { id: 'Tampilan', en: 'Appearance' },
  menuAppearanceHint: { id: 'Intensitas kaca dan bahasa', en: 'Glass intensity and language' },
  menuNotifications: { id: 'Notifikasi', en: 'Notifications' },
  menuNotificationsHint: { id: 'Pilih kabar yang ingin diterima', en: 'Choose what updates you receive' },
  menuPrivacyPolicy: { id: 'Kebijakan privasi', en: 'Privacy policy' },
  menuPrivacyPolicyHint: { id: 'Cara data kamu digunakan', en: 'How your data is used' },
  menuDeleteAccount: { id: 'Hapus akun', en: 'Delete account' },
  menuDeleteAccountHint: { id: 'Ajukan penghapusan data akun', en: 'Request account data deletion' },

  // KPR
  kprSimTitle: { id: 'Simulasi KPR', en: 'Mortgage simulator' },
  modeNewKpr: { id: 'KPR baru', en: 'New mortgage' },
  modeTakeover: { id: 'Take-over KPR', en: 'Mortgage takeover' },
  propertyPrice: { id: 'Harga properti', en: 'Property price' },
  yearsSuffix: { id: 'tahun', en: 'years' },
  downPaymentSimple: { id: 'Uang muka', en: 'Down payment' },
  tenor: { id: 'Tenor', en: 'Tenor' },
  rateAssumption: { id: 'Asumsi suku bunga', en: 'Rate assumption' },
  perYear: { id: '/ tahun', en: '/ year' },
  estimatedMonthlyInstallment: { id: 'Estimasi cicilan bulanan', en: 'Estimated monthly installment' },
  loanAmount: { id: 'Jumlah pinjaman', en: 'Loan amount' },
  totalDownPayment: { id: 'Total uang muka', en: 'Total down payment' },
  exploreSimilarInstallment: { id: 'Jelajahi estimasi cicilan serupa', en: 'Explore similar installment estimates' },
  takeoverIntro: { id: 'Pindahkan sisa cicilan KPR-mu ke suku bunga baru dan lihat estimasi penghematannya.', en: 'Move your remaining mortgage balance to a new rate and see the estimated savings.' },
  remainingPrincipal: { id: 'Sisa pokok pinjaman', en: 'Remaining principal' },
  currentInstallmentPerMonth: { id: 'Cicilan saat ini per bulan', en: 'Current installment per month' },
  remainingTenor: { id: 'Sisa tenor', en: 'Remaining tenor' },
  newInterestRate: { id: 'Suku bunga baru', en: 'New interest rate' },
  newInstallmentPerMonth: { id: 'Cicilan baru per bulan', en: 'New installment per month' },
  monthlySavings: { id: 'Hemat per bulan', en: 'Monthly savings' },
  totalEstimatedSavings: { id: 'Estimasi hemat total', en: 'Total estimated savings' },
  kprDisclaimer: {
    id: 'HASIL INI ADALAH ESTIMASI, BUKAN PERSETUJUAN, PENAWARAN, ATAU KEPUTUSAN PEMBERIAN PINJAMAN DARI BANK MANAPUN. SUKU BUNGA AKTUAL DAPAT BERBEDA TERGANTUNG PRODUK DAN KEBIJAKAN BANK.',
    en: 'THIS RESULT IS AN ESTIMATE, NOT AN APPROVAL, OFFER, OR LENDING DECISION FROM ANY BANK. ACTUAL RATES MAY DIFFER DEPENDING ON THE PRODUCT AND BANK POLICY.',
  },
  saveThisSimulation: { id: 'Simpan simulasi ini', en: 'Save this simulation' },
  savedTitle: { id: 'Tersimpan', en: 'Saved' },
  simulationSavedToWorkspace: { id: 'Simulasi disimpan ke workspace kamu.', en: 'Simulation saved to your workspace.' },
  ok: { id: 'OK', en: 'OK' },
  simulationLabel: { id: 'Simulasi', en: 'Simulation' },
  takeoverKprLabel: { id: 'Take-over KPR', en: 'Mortgage takeover' },
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
  return useCallback((key: StringKey) => strings[key][lang], [lang]);
}
