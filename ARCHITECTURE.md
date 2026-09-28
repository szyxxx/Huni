# Arsitektur Huni

Kondisi implementasi per 28 September 2026. Dokumen ini menjelaskan kode yang ada di repository, bukan rancangan layanan masa depan.

## Aplikasi

- Satu aplikasi Expo SDK 57 / React Native 0.86 / React 19.2 di root repository. Expo Router memakai route di `src/app` untuk Android, iOS, dan web.
- TanStack Query mengambil katalog properti dan proyek melalui `src/data/repository.ts`. Tanpa konfigurasi Supabase, katalog demo di `src/data/properties.ts` dan `src/data/projects.ts` dipakai. Dengan Supabase aktif, error query diteruskan ke layar.
- Zustand di `src/store/useAppStore.ts` menyimpan workspace interaktif. Tamu disimpan dengan AsyncStorage melalui `src/store/guestWorkspace.ts`; akun dibaca/ditulis melalui `src/data/sync.ts` ke Supabase. Pergantian akun menghapus data akun sebelumnya sebelum data baru dimuat. Workspace tamu tetap terpisah di perangkat saat akun login dan dipulihkan setelah logout.
- `src/auth/AuthProvider.tsx` mengelola Google OAuth, OTP telepon, sesi, dan hidrasi workspace. Data sesi lama tidak boleh mengisi workspace akun baru.
- Peta memakai MapLibre dalam development/release build. Expo Go dan web memakai fallback yang tersedia di `PropertyMapView`.

## Backend

- Skema PostgreSQL, RLS, dan trigger berada di `supabase/migrations`. RLS membatasi tabel workspace berdasarkan `auth.uid()`; join shortlist hanya melalui `shortlist-invite`, yang memvalidasi kode undangan.
- `price-drop-alerts` memproses event harga yang dibuat trigger database dan memerlukan secret job. Preferensi notifikasi akun disimpan di `notification_prefs`.
- `process-account-deletions` menghapus akun yang mempunyai permintaan pending. Fungsi memerlukan secret job dan harus dijadwalkan di proyek Supabase. Penghapusan akun mengandalkan foreign key cascade pada tabel workspace.
- Kedua fungsi admin memakai service role hanya di server. Kunci service role tidak boleh dimasukkan ke aplikasi.

## Batas saat ini

- Tidak ada Next.js web publik, portal penjual, konsol admin, Redis, OpenSearch, atau API modular tersendiri di repository ini.
- Katalog terhubung memakai query Supabase langsung; data demo hanya dipakai saat Supabase tidak dikonfigurasi.
- Workspace tamu belum diimpor otomatis ke akun. Data tersebut sengaja tetap lokal dan dapat diakses lagi setelah logout. Import perlu alur pilihan pengguna dan penanganan ID katalog demo yang bukan UUID database.
- Halaman publik `huni.id` untuk kebijakan privasi/penghapusan akun, penjadwalan fungsi backend, build perangkat, serta konfigurasi Play Console perlu verifikasi deployment sebelum rilis.

## Pemeriksaan

Jalankan `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db`, `npx expo-doctor`, dan `npx expo export --platform web`. Test database memerlukan Docker lokal.
