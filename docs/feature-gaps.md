# Gap fitur Huni

Status pada 28 September 2026. Dokumen audit fitur lama telah diganti karena banyak barisnya sudah tidak sesuai kode. Temuan teknis dan perbaikan audit ada di `audit-2026-09-28.md` dan riwayat Git.

## Masih memerlukan sumber atau keputusan produk

| Area | Gap yang benar-benar tersisa |
| --- | --- |
| Rilis | Domain `huni.id`, halaman publik yang terdeploy, tinjauan legal kebijakan privasi, aset Play, akun Play Console, build dan uji perangkat belum diverifikasi. |
| Backend live | Migrasi RLS, dua Edge Function admin, secret job, serta jadwal Cron belum diterapkan/diuji di proyek Supabase live. |
| Workspace tamu | Data tamu kini persisten dan terpisah dari akun. Impor otomatis ke akun belum dibuat karena katalog demo memakai ID `p1` dkk., sedangkan database memakai UUID. |
| Pencarian | Katalog diunduh penuh; belum ada pagination/cursor untuk inventaris besar. Hierarki lokasi, rent period, sertifikat, dan rent-to-own belum ada pada model. |
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
