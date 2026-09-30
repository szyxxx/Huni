# Gap fitur Huni

Status pada 30 September 2026. Dokumen audit fitur lama telah diganti karena banyak barisnya sudah tidak sesuai kode. Temuan teknis dan perbaikan audit ada di `audit-2026-09-28.md`, `audit-2026-09-29.md`, dan riwayat Git.

## Permintaan v2 Axel (30 Sep) — status

| Item | Status |
| --- | --- |
| Redesign premium/Apple-style, layout non-generic | Sudah berjalan sejak sesi sebelumnya (lihat commit "Redesign floating tab navigation", "Refine editorial property discovery…"); belum ditinjau ulang terhadap 2 referensi screenshot Axel secara spesifik. |
| Ganti nama "Cari" jadi "Explore" | **Selesai** — label tab bar + ikon compass. Nama file tetap `search.tsx`, tidak ada link yang putus. |
| Intensitas kaca bisa diatur | **Selesai** — Settings > Tampilan, Low/Medium/High, satu token dipakai `GlassSurface` di semua tempat, hormati Reduce Transparency sistem. |
| Localization id/en menyeluruh | **Baru infrastruktur** — `src/lib/i18n.ts` + saklar bahasa di Settings (device/id/en). Hanya layar Settings yang terpasang; audit string di seluruh app (alert, error, enum, format harga/tanggal) belum dikerjakan — ini masih pekerjaan besar tersendiri. |
| "Tanya AI" di kolom pencarian | Belum dikerjakan. Rencana: layar describe-kebutuhan (mic + kirim) di atas `intentParser.ts` yang sudah ada, panggilan LLM lewat Supabase Edge Function (kunci `ANTHROPIC_API_KEY` sebagai secret function, bukan di app) dengan fallback ke parser lokal saat function gagal/tidak ada. |
| Contact Agent & Schedule Tour di detail properti | Belum dikerjakan. Perlu tabel `tour_requests` baru + picker tanggal/waktu + handoff WhatsApp, plus kartu agent dengan "Lihat profil". |
| 3D gallery / virtual tour (beta) | Belum dikerjakan. Perlu kolom/bucket aset 3D di skema pengiklan, viewer berbasis WebView atau expo-gl/three (supaya Expo Go tidak rusak), label "beta" jelas. |
| Peta Explore: indikator taman/minimarket/mall/sekolah dsb, muncul hanya saat zoom ≤10km dari properti | Belum dikerjakan. Sumber data: Overpass/OpenStreetMap, sebaiknya di-cache lewat Supabase supaya tidak memukul Overpass langsung dari client. |
| Rombak mekanisme Bandingkan + halaman Tersimpan jadi satu workspace kohesif | Belum dikerjakan — ini permintaan paling besar; perlu proposal alur baru (koleksi, watch list, hidden, baru dilihat, compare tray persisten, sheet perbandingan dengan highlight best-value) sebelum mulai membangun. |

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
