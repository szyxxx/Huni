# Gap fitur Huni

Status pada 30 September 2026. Dokumen audit fitur lama telah diganti karena banyak barisnya sudah tidak sesuai kode. Temuan teknis dan perbaikan audit ada di `audit-2026-09-28.md`, `audit-2026-09-29.md`, dan riwayat Git.

## Permintaan v2 Axel (30 Sep) — status

| Item | Status |
| --- | --- |
| Redesign premium/Apple-style, layout non-generic | **Ditinjau, sudah sesuai** — dicek langsung terhadap brief: hero full-bleed + content sheet membulat yang overlap (`property/[id].tsx` `content` style, `marginTop: -32` + `borderTopRadius: 30`), sapaan "Selamat pagi, nama" (Home), segmented switch Beli/Sewa/Proyek Baru, city chips, kartu gambar besar membulat, dan intensitas kaca yang konsisten lewat `GlassSurface` — semua sudah ada dari pekerjaan redesign sesi-sesi sebelumnya. Tidak dirombak ulang dari nol karena sudah sesuai dan merombak ulang berisiko merusak yang sudah baik; belum ditinjau piksel-demi-piksel terhadap 2 referensi screenshot Axel secara spesifik. |
| Ganti nama "Cari" jadi "Explore" | **Selesai** — label tab bar + ikon compass. Nama file tetap `search.tsx`, tidak ada link yang putus. |
| Intensitas kaca bisa diatur | **Selesai** — Settings > Tampilan, Low/Medium/High, satu token dipakai `GlassSurface` di semua tempat, hormati Reduce Transparency sistem. |
| Localization id/en menyeluruh | **Sebagian** — `src/lib/i18n.ts` diperluas signifikan; Home, tab bar, dan komponen bersama `DataStatus` (tombol "Coba lagi") sudah 100% dipakaikan `t()`, termasuk sufiks harga (/bulan → /mo). Explore, detail properti, Tersimpan, Profil, dan KPR **masih string Indonesia keras** — belum diaudit. Mata uang tetap Rupiah di kedua bahasa (ini pasar Indonesia, bukan app multi-currency), hanya label UI yang berganti. |
| "Tanya AI" di kolom pencarian | **Selesai** — layar `/ai-search`, Edge Function `ai-search` provider-agnostic (OpenAI-compatible: Anthropic/9router/OpenRouter/dll via secret `AI_BASE_URL`/`AI_API_KEY`/`AI_MODEL`), fallback ke parser lokal. Input suara baru UI (belum ada speech-to-text nyata — sengaja ditunda, lihat riwayat commit). BYOK per-user belum dibangun (perlu penyimpanan terenkripsi). |
| Contact Agent & Schedule Tour di detail properti | **Selesai** — kontak WhatsApp & jadwalkan tur (pill hari/jam, tanpa native date picker) sekarang mencatat lead ke tabel `leads` yang sudah ada tapi tidak pernah dipakai. Halaman profil agent baru di `/agent/[name]`. |
| 3D gallery / virtual tour (beta) | **Selesai** — kolom `virtual_tour_url`/`virtual_tour_kind` + bucket Storage `virtual-tours`, viewer berbasis WebView (`<model-viewer>`/Pannellum, bukan expo-gl/three) di `/virtual-tour/[id]`. 1 properti demo terisi aset placeholder. Alur upload sisi pengiklan belum ada (masih proses admin/backend). |
| Peta Explore: indikator taman/minimarket/mall/sekolah dsb, muncul hanya saat zoom ≤10km dari properti | **Selesai** — `src/lib/overpass.ts` (Overpass/OSM, di-cache per sel koordinat), aktif di peta Explore (mengikuti pin terpilih) maupun peta detail properti. |
| Rombak mekanisme Bandingkan + halaman Tersimpan jadi satu workspace kohesif | **Selesai** — `CompareTray` mengambang persisten di Explore & Tersimpan (bukan cuma nempel di satu layar), layar Bandingkan menyorot nilai terbaik per baris + tombol hapus/ganti per kolom. |
| Simulasi KPR dengan program bank (fix→floating) | **Selesai** — mode "Program bank" baru di `/kpr` (default), `calculateBankProgram()` di `src/lib/kpr.ts` mengamortisasi bunga fix atas tenor penuh lalu menghitung ulang sisa pokok dengan bunga floating estimasi. Data bank (`BANK_PROGRAMS`) masih seed ilustratif, belum ada kemitraan bank nyata — pindah ke tabel Supabase begitu ada program asli. |

## Masih memerlukan sumber atau keputusan produk

| Area | Gap yang benar-benar tersisa |
| --- | --- |
| Rilis | Domain `huni.id`, halaman publik yang terdeploy, tinjauan legal kebijakan privasi, aset Play, akun Play Console, build dan uji perangkat belum diverifikasi. |
| Backend live | Migrasi RLS, dua Edge Function admin, secret job, serta jadwal Cron belum diterapkan/diuji di proyek Supabase live. |
| Workspace tamu | Data tamu kini persisten dan terpisah dari akun. Impor otomatis ke akun belum dibuat karena katalog demo memakai ID `p1` dkk., sedangkan database memakai UUID. |
| Pencarian | Katalog diunduh penuh; belum ada pagination/cursor untuk inventaris besar. Hierarki lokasi, rent period, sertifikat, dan rent-to-own belum ada pada model. |
| Peta | Katalog contoh sekarang tampil dengan pin melalui koordinat sementara di aplikasi. Migrasi `0008_seed_coordinates.sql` belum diterapkan ke Supabase live; pin berdekatan pada zoom nasional masih perlu pengelompokan. Listing baru wajib memasok koordinat yang akurat. |
| Personalisasi lokasi | Waktu tempuh dari tempat favorit dan data POI nyata belum tersedia; sebagian label lokasi pada data demo masih statis. |
| Notifikasi | Penurunan harga memiliki pipeline server. Pencarian cocok, perubahan listing, promosi proyek, aktivitas shortlist, dan tindak lanjut lead masih berupa preferensi tanpa job pengirim. Hindari mengklaim kategori itu sudah aktif sampai pemicu serta persetujuannya tersedia. |
| Laporan listing | Laporan kini masuk ke tabel Supabase dengan RLS. Antrean/konsol moderasi dan SLA tindak lanjut masih perlu proses operasional. |
| Fitur lanjutan | Profil preferensi yang dapat diedit, perbandingan unit proyek, dan direktori produk bank memerlukan desain data/sumber tepercaya. Lokalisasi bahasa Inggris ditunda. |

## Yang sudah tersambung di repo

- Katalog demo hanya dipakai saat Supabase tidak dikonfigurasi; kegagalan query live ditampilkan sebagai error.
- ID workspace yang dikirim ke kolom UUID valid, penulisan remote melaporkan error, dan sesi akun dibersihkan saat logout/pergantian akun.
- Workspace tamu tersimpan di AsyncStorage; daftar tamu dipulihkan setelah logout.
- Join shortlist melalui kode undangan, dengan RLS menutup insert langsung. Tautan `huni://` dapat dibuka pada build terpasang; domain web fallback tetap menunggu deployment.
- Preferensi notifikasi akun disimpan di Supabase; harga turun dibuat dari perubahan database, bukan payload request.
- Permintaan hapus akun tercatat dengan RLS terbatas dan ada worker admin yang harus dijadwalkan di deployment.
- Tombol kontak hanya aktif jika pengiklan memiliki nomor WhatsApp yang valid; katalog demo tidak lagi mengarahkan ke nomor palsu.

Tabel ini adalah backlog produk. Tidak semua item merupakan bug rilis saat ini; fitur yang membutuhkan sumber data atau layanan eksternal baru dapat dinyatakan selesai setelah diverifikasi pada deployment.
