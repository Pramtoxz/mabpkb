# MABPKB — Instruksi Wajib untuk Claude

**BACA [diskus.md](diskus.md) SAMPAI HABIS SEBELUM MENYENTUH FILE APAPUN DI PROJECT INI.** Ini bukan saran, ini instruksi wajib. Dokumen itu adalah sumber kebenaran tunggal untuk arsitektur, keputusan, dan status project.

## Fakta paling penting (kalau cuma sempat baca ini, minimal tahu ini)

1. **Project ini BUKAN greenfield dan BUKAN dalam kondisi "belum ada kode".** Ada implementasi kerja penuh (5 layar scan, native volume-button module, OCR, barcode, API) yang sudah melalui satu sesi migrasi besar (30 Juli 2026, lihat `diskus.md` Bagian 11).
2. **Migrasi kode SUDAH SELESAI ditulis** (kamera `react-native-camera-kit` → `vision-camera` 4.7.2, OCR dipindah step, barcode ke `useCodeScanner`, crop pipeline OpenCV) dan **lolos `tsc` + `gradlew assembleDebug`**.
3. **BELUM PERNAH dites di device fisik sama sekali.** Kalau kamu sesi baru dan ada device terhubung: itu prioritas #1, lihat `diskus.md` Bagian 11 → "LANGKAH SELANJUTNYA" untuk urutan pengujian yang disarankan.
4. **Jangan percaya dokumentasi library (termasuk Context7) begitu saja tanpa cross-check ke `node_modules/<package>/**/*.d.ts` yang BENAR-BENAR ter-install.** Sesi sebelumnya ketemu kasus nyata dimana Context7 menunjukkan API versi lama untuk `react-native-fast-opencv` — lihat `diskus.md` Bagian 11 untuk detail insidennya sebagai contoh konkret kenapa aturan ini ada.
5. Semua keputusan produk/flow (urutan halaman BPKB, mapping ke `images[]`, dst) di `diskus.md` sudah **final, dikonfirmasi langsung oleh user** — jangan diasumsikan ulang atau "diperbaiki" tanpa alasan kuat dan konfirmasi baru.

Kalau ada bagian `diskus.md` yang terasa kontradiktif dengan kode yang kamu baca langsung, **percaya kode** (itu kebenaran saat ini) dan catat perbedaannya — kemungkinan ada perubahan yang belum sempat didokumentasikan.
