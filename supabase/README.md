# Backend Supabase Huni

## Terapkan skema

1. Hubungkan proyek dengan `supabase link --project-ref <ref>`.
2. Terapkan semua migrasi berurutan dengan `supabase db push`. Migrasi `0004` menutup bypass undangan shortlist; `0005` membatasi status permintaan hapus akun dan mengisi preferensi notifikasi; `0006` membuat event harga otomatis dan klaim pemrosesan; `0007` menambah nomor kontak pengiklan dan laporan listing.
3. Opsional: jalankan `seed/seed.sql` untuk katalog contoh. Aplikasi dengan Supabase aktif tidak memakai katalog mock jika query gagal.
4. Atur Google OAuth, SMS OTP, URL redirect, dan anon key aplikasi sesuai `.env.example`. Kunci service role hanya boleh ada di backend.

## Minat hunian baru

Proyek contoh belum memiliki `advertisers.owner_id` atau nomor kontak resmi. Formulir minat pada proyek tersebut adalah simulasi yang disimpan hanya di perangkat; aplikasi menyatakannya secara eksplisit dan menyediakan opsi menghapusnya.

Untuk mengaktifkan kontak nyata, terapkan migrasi `0012_project_inquiry_access.sql`, lalu tautkan akun developer yang terverifikasi ke `advertisers.owner_id` melalui proses admin. Setelah itu pembeli yang masuk dapat mengirim minat ke tabel `leads` dan pemilik proyek dapat membukanya dari profil developer → **Minat pembeli** dan membalas melalui WhatsApp. Jangan mengisi `owner_id` berdasarkan nama developer saja. Migrasi ini juga menghapus lead beserta detail kontaknya saat akun pembeli dihapus.

## Fungsi admin

Konfigurasi `config.toml` mematikan pemeriksaan JWT gateway hanya untuk `price-drop-alerts` dan `process-account-deletions`; kedua handler menolak request tanpa header `x-huni-job-secret` yang cocok. Buat dua secret acak yang berbeda di Supabase Edge Function Secrets: `PRICE_DROP_JOB_SECRET` dan `ACCOUNT_DELETION_JOB_SECRET`. Deploy kedua fungsi setelah migrasi diterapkan. `shortlist-invite` tetap memerlukan JWT pengguna.

Jadwalkan POST ke `/functions/v1/price-drop-alerts` setiap beberapa menit dan ke `/functions/v1/process-account-deletions` setidaknya sekali sehari melalui Supabase Cron/`pg_net` atau scheduler internal. Simpan URL dan dua secret pemanggil di Vault; jangan menaruhnya di SQL yang dikomit, aplikasi, atau chat. Setiap job harus mengirim `x-huni-job-secret` yang sesuai. Periksa respons non-200 dan alert pada kegagalan. Lihat [panduan Supabase Cron](https://supabase.com/docs/guides/functions/schedule-functions) dan [konfigurasi Edge Function](https://supabase.com/docs/guides/functions/function-configuration).

Trigger `record_price_drop` membuat satu event untuk setiap update harga properti aktif yang turun. Function mengklaim event melalui RPC, lalu memeriksa watch, preferensi, dan token sebelum mengirim push. Klaim kadaluarsa setelah 15 menit agar kegagalan dapat dicoba ulang. Push eksternal tidak menyediakan transaksi atomik bersama Postgres; crash setelah Expo menerima push tetapi sebelum event ditandai terkirim masih dapat menyebabkan duplikat. Pantau `failedEventIds` pada respons job.

Worker hapus akun memproses maksimal 100 request pending per eksekusi dan memakai `auth.admin.deleteUser`; foreign key menghapus data workspace terkait. Audit minimal disimpan di `account_deletion_audit` tanpa user ID. Pantau `failedRequestIds` dan pastikan jadwal aktif sebelum mengiklankan tenggat pemrosesan di aplikasi atau halaman web.

## Verifikasi

`npm run test:db` menjalankan PostgreSQL sementara lewat Docker, menerapkan semua migrasi, dan menguji RLS shortlist, status permintaan penghapusan, serta event penurunan harga. Ini tidak membuktikan konfigurasi proyek live, pengiriman push, OAuth, atau jadwal cron. Uji semuanya lagi pada staging sebelum rilis.
