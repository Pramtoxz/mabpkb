# ACIAX BPKB Scanner — Project Blueprint

> Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk AI coding agent yang mengerjakan project ini. Baca seluruh dokumen sebelum menulis kode apapun. Jangan berasumsi API atau library berdasarkan training data — lihat Bagian 4.

**Status:** ✅ **Migrasi kode SUDAH SELESAI ditulis dan lolos verifikasi compile-time** (`tsc` bersih + `./gradlew assembleDebug` BUILD SUCCESSFUL, 30 Juli 2026). **❌ BELUM PERNAH DIJALANKAN/DITES DI DEVICE FISIK** — sesi yang mengerjakan ini tidak punya device/emulator terhubung sama sekali. **INI ACTION ITEM PALING PENTING untuk sesi berikutnya: colok HP, `npx react-native run-android`, uji step 1→5 sampai submit.** Detail lengkap apa yang berubah, apa yang belum teruji, dan langkah pengujian ada di **Bagian 11 — WAJIB DIBACA DULU** sebelum menyentuh file apapun.
**Terakhir diverifikasi:** 30 Juli 2026 (sesi migrasi penuh — lihat Bagian 11 untuk status akhir & langkah selanjutnya).

---

## 1. Konteks & Tujuan

Aplikasi internal (bukan untuk publik/Play Store) untuk **1 operator** di PT Menara Agung Honda, dipakai memproses **ribuan dokumen BPKB per hari**. Operator memotret 4 halaman/area dokumen kendaraan menggunakan HP yang dipasang di tripod, dipicu oleh **shutter fisik** (tombol volume HP atau bluetooth shutter remote — keduanya secara hardware mensimulasikan tombol volume-down, jadi cukup satu listener).

Tujuan aplikasi: capture 4 gambar berkualitas scan (bukan foto biasa), ekstrak nomor mesin & nomor BPKB otomatis di device, lalu upload ke backend Laravel yang sudah ada (lihat Bagian 7) untuk digabung jadi 1 PDF per unit.

**Ini BUKAN kloningan CamScanner generik.** Border detection dan "scan look" filter dipakai sebagai teknik, tapi seluruh flow dirancang spesifik untuk throughput tinggi dengan device statis di tripod, bukan untuk kasus umum "user pegang HP bebas".

---

## 2. Scope & Non-Goals

- **Platform:** Android only. Tidak ada dukungan iOS, tidak perlu ditulis kode conditional untuk iOS.
- **User:** 1 operator per instalasi aplikasi. Tidak perlu multi-user, auth login, atau role management di sisi app (auth API cukup pakai static `SECRET-KEY` header, lihat Bagian 7).
- **Tidak ada cloud sync, tidak ada iklan, tidak ada fitur CamScanner generik lain** (watermark, share ke app lain, folder organizer, dsb). Fokus sempit ke satu alur kerja.
- **Generate PDF final dilakukan di backend** (PHP/Imagick), bukan di aplikasi. App hanya mengirim gambar mentah/hasil crop.
- Tidak perlu OCR bahasa selain Latin/angka (nomor mesin & BPKB alfanumerik standar Indonesia).

---

## 3. Tech Stack (terverifikasi via web search, 30 Juli 2026)

| Layer                           | Package                                                                    | Versi/status terverifikasi | Catatan                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Framework                       | React Native                                                               | **0.86**                   | Rilis 11 Juni 2026, New Architecture **wajib** (bridge lama sudah dimatikan permanen sejak 0.82)                    |
| Kamera core                     | `react-native-vision-camera`                                               | **4.7.2** (DIPIN, bukan 5.2.0) | Sengaja mundur dari versi terbaru — lihat "Kenapa pin ke v4" di bawah tabel                                      |
| Dependency wajib vision-camera  | `react-native-worklets-core`, `react-native-reanimated` (sudah terpasang)   | —                          | v4 pakai `worklets-core` untuk frame processor. **BUKAN** `react-native-nitro-modules`/`react-native-nitro-image` — itu kebutuhan v5, tidak dipakai di sini |
| Barcode Samsat (step 4)         | **`useCodeScanner`** — hook bawaan `react-native-vision-camera` v4          | —                          | BUILT-IN, tidak perlu package tambahan. `react-native-vision-camera-barcode-scanner` **TIDAK dipakai** — semua versi package itu (dari beta pertama Feb 2026 s/d 5.2.0) mewajibkan Nitro modules, tidak ada rilis yang kompatibel v4 |
| Border detect + crop (step 1–4) | `react-native-fast-opencv`, dipakai **post-capture (one-shot)**, BUKAN live frame processor | —      | Implementasi final di [src/utils/documentScanner.ts](src/utils/documentScanner.ts) cuma proses foto SETELAH capture (bounding-box crop), bukan live overlay real-time. `react-native-document-scanner-plugin` **TIDAK dipakai** — lihat Bagian 11 untuk alasan & detail API yang benar (dokumentasi Context7 untuk library ini SALAH VERSI, jangan diulang) |
| OCR nomor mesin (step 3)        | `@react-native-ml-kit/text-recognition`                                    | **1.5.2** (terpasang: `^2.0.0`, cek ulang saat instalasi) | Native module gaya lama, jalan lewat interop layer RN (bukan TurboModule native) — lihat catatan resiko di Bagian 4. Tidak terpengaruh pin vision-camera v4, library ini berdiri sendiri |
| Volume button trigger           | Native module custom (Kotlin, override `dispatchKeyEvent` di MainActivity) | —                          | Tidak terpengaruh versi RN. Bluetooth shutter remote otomatis ke-cover karena secara hardware = tombol volume-down  |
| HTTP client                     | fetch bawaan RN (`src/api/client.ts`)                                       | —                          | Sudah terimplementasi. Base URL & secret key dari `.env` via `react-native-config`, jangan hardcode                 |

### Kenapa pin vision-camera ke v4.7.2, bukan 5.2.0 terbaru (keputusan 30 Juli 2026)

vision-camera 5.2.0 adalah full-rewrite ke Nitro Modules yang baru rilis ~7 minggu sebelum sesi diskusi ini — ekosistem pendukungnya (plugin barcode, tutorial OpenCV) belum tentu mengikuti. Dicek langsung (bukan asumsi):

- **v4.7.2 terkonfirmasi mendukung New Architecture** — ada logic `isNewArchitectureEnabled()` di `android/build.gradle`-nya yang build sesuai setting `newArchEnabled` project, jadi kompatibel dengan RN 0.86 yang mewajibkan New Architecture.
- **`react-native-worklets-core`** (dependency v4) adalah package independen (peer dep cuma react/react-native), sudah jadi pasangan standar vision-camera+Reanimated bertahun-tahun — **ditambahkan**, bukan menggantikan `react-native-worklets` dari Reanimated 4.5.1 yang sudah ada. Dua runtime worklet ini biasa hidup berdampingan.
- **Barcode scanning jadi LEBIH SEDERHANA di v4**, bukan lebih rumit: `useCodeScanner` built-in, sementara di v5 justru butuh package terpisah (`react-native-vision-camera-barcode-scanner`) yang SELALU mewajibkan Nitro — tidak ada jalan tengah.
- **Border detection**: `react-native-document-scanner-plugin` (rencana awal) ternyata tidak bisa dipakai sama sekali di kedua versi vision-camera — API-nya cuma `scanDocument()` yang buka native UI sendiri. Solusinya `react-native-fast-opencv`, tapi **implementasi final TIDAK jadi pakai `useFrameProcessor`/live overlay** — dipakai post-capture one-shot saja (lebih aman untuk ditulis tanpa bisa tes device langsung). Live overlay real-time sengaja di-defer, lihat Bagian 11.
- Trade-off yang diterima: kehilangan peningkatan performa Nitro dan primitif baru v5 (`<SkiaCamera>`, dst).
- **Update 30 Juli 2026 — SUDAH diverifikasi compile-time:** `./gradlew assembleDebug` BUILD SUCCESSFUL dan `npx tsc --noEmit` bersih untuk seluruh kombinasi vision-camera 4.7.2 + worklets-core + react-native-fast-opencv. **Belum diverifikasi runtime** (tidak ada device fisik saat sesi ini berjalan) — lihat Bagian 11 untuk langkah pengujian selanjutnya.

---

## 4. INSTRUKSI WAJIB UNTUK CODING AGENT — Cegah Halusinasi Library

1. **Project ini SENGAJA pin `react-native-vision-camera` ke v4.7.2, BUKAN versi terbaru (5.2.0).** Ini keputusan sadar (lihat Bagian 3), bukan ketinggalan update — **JANGAN** upgrade ke v5.x tanpa persetujuan eksplisit user. Karena kebanyakan tutorial/hasil pencarian terbaru soal vision-camera akan mengasumsikan v5 (Nitro, `useFrameOutput`, `<SkiaCamera>`, `react-native-vision-camera-barcode-scanner`), **WAJIB cek Context7 dengan library ID versi v4.7.2 secara eksplisit** (bukan default/latest) sebelum menulis kode apapun yang memanggil package ini. Pola yang benar untuk project ini: `photo={true}`/`takePhoto()` untuk still capture, `useCodeScanner` untuk barcode. **`useFrameProcessor` TIDAK dipakai** — OpenCV dijalankan post-capture (one-shot di `documentScanner.ts`), bukan live frame processor, lihat Bagian 11.
2. **Barcode scanning DI PROJECT INI pakai `useCodeScanner` bawaan v4** — jangan install `react-native-vision-camera-barcode-scanner` (package itu cuma untuk v5, mewajibkan Nitro, tidak kompatibel dengan pin v4.7.2 di project ini).
3. `@react-native-ml-kit/text-recognition` adalah native module gaya lama (bukan TurboModule native). Ini **sengaja** dipilih karena dukungan Android-nya paling matang dibanding alternatif (`@infinitered/react-native-mlkit` secara eksplisit menyatakan dukungan Androidnya masih under active development). Kalau nanti muncul error terkait New Architecture/interop layer saat instalasi, itu bukan tanda salah pilih library — solusinya cek pengaturan interop layer RN, bukan ganti library dulu.
4. Semua versi di Bagian 3 adalah hasil riset per 30 Juli 2026. Library RN (khususnya ekosistem vision-camera/Nitro) berubah cepat — **selalu cross-check versi & breaking changes terbaru via Context7 sebelum instalasi**, terutama kalau tanggal pengerjaan sudah jauh dari tanggal verifikasi di atas.
5. Kalau Context7 menunjukkan versi lebih baru dari yang tertulis di sini, ikuti Context7 (sumber lebih current), tapi tetap pertahankan keputusan arsitektur di Bagian 5 & 6 (flow, bukan tech pinning, yang jadi kontrak).

---

## 5. UX Flow — State Machine

```
enum ScanStep {
  HAL_1_IDENTITAS_PEMILIK,        // manual shutter — halaman "Identitas Pemilik" BPKB
  HAL_2_IDENTITAS_KENDARAAN,      // manual shutter — halaman "Identitas Kendaraan" BPKB
  HAL_3_IDENTITAS_KENDARAAN_LANJUTAN, // manual shutter → foto INI JUGA sumber OCR nomor mesin (satu capture, dua guna)
  HAL_4_DOKUMEN_PERSYARATAN,      // manual shutter — halaman "Dokumen Persyaratan" BPKB, foto polos
  BARCODE_SAMSAT,                 // live scan (bukan still capture) — auto-advance saat barcode terbaca. TIDAK menghasilkan foto, cuma teks nobpkb
  DONE
}
```

> **Revisi final 30 Juli 2026:** ini adalah 5 halaman/section resmi BPKB, BUKAN 4 foto generik + 1 "foto identitas" seperti draft sebelumnya di dokumen ini. Nama & urutan dikonfirmasi langsung oleh user:
> Hal 1 = Identitas Pemilik, Hal 2 = Identitas Kendaraan, Hal 3 = Identitas Kendaraan Lanjutan (+OCR nomor mesin dari foto yang sama), Hal 4 = Dokumen Persyaratan, Hal 5 = Barcode (teks `nobpkb` saja, tidak ada foto).
> **Perubahan dari kode yang sudah ada:** saat ini OCR nomor mesin jalan di capture ke-4 terpisah dari foto halaman 3 (dua kali jepret). Ini perlu digabung — OCR pindah ke foto Hal 3 (satu capture, dua guna), dan capture ke-4 (sekarang punya logic OCR) diubah jadi foto polos "Dokumen Persyaratan". Lihat Bagian 8.

### Aturan interaksi per step

- **Step 1 (Identitas Pemilik) & Step 2 (Identitas Kendaraan):** Tombol volume/shutter fisik memicu **still capture** (bukan live/continuous), foto polos. Tidak ada auto-detect real-time yang men-trigger capture — sepenuhnya manual, karena posisi HP di tripod tetap dan operator yang menentukan timing.
- **Step 3 (Identitas Kendaraan Lanjutan):** Tombol volume memicu still capture, **BARU SETELAH ITU** OCR dijalankan di foto hasil capture yang SAMA (satu capture, dua guna — jadi `images[2]` DAN sumber OCR, bukan dua kali jepret). Alur: capture → OCR baca teks → hit `GET /api/get-dealer?nomesin=...` → sukses → auto-advance ke step 4. Gagal (OCR tidak baca ATAU dealer tidak ketemu) → tetap di step 3, tombol volume dipakai untuk retry.
- **Step 4 (Dokumen Persyaratan):** Tombol volume memicu still capture — **foto polos**, sama seperti step 1 & 2, tanpa OCR/ekstraksi data tambahan. Setelah capture → auto-advance ke step 5.
- **Step 5 (Barcode):** Berbeda mekanisme — **live barcode scanning** (kamera terus membaca frame), bukan still+proses. Begitu barcode valid terbaca → dapat teks `nobpkb` → auto-advance ke DONE. **Step ini TIDAK menghasilkan foto** (tidak ada slot `images[]` untuk step ini) — murni ekstraksi teks. Alasan teknis: barcode detection jauh lebih ringan dibanding OCR teks bebas, live-scan disini works well dan lebih cepat daripada still-capture-lalu-proses.
- **Border detection (live overlay) berjalan visual di semua step still-capture (1–4)** sebagai bantuan visual (kotak/garis mengikuti tepi dokumen), TAPI **tidak memicu capture otomatis** dan **tidak berjalan di step 5** (barcode pakai live-scan sendiri, bukan border overlay). Capture selalu menunggu tombol volume ditekan. **STATUS 30 Juli 2026: BELUM diimplementasikan.** Overlay yang jalan sekarang masih `DocumentOverlay` versi lama (dim + cutout box statis + border pulsing, TIDAK mengikuti tepi dokumen secara real-time) — sengaja di-defer, lihat Bagian 11. Deteksi border yang SUDAH jalan cuma post-capture (sesudah tombol ditekan), lihat Bagian 6.
- **Debounce wajib ~800ms–1 detik** pada listener volume button. Selama proses (capture → crop → OCR/API) masih berjalan, abaikan/queue penekanan tombol berikutnya.
- **Feedback non-visual:** haptic vibration pendek saat capture berhasil masuk thumbnail; pola vibration berbeda (misal 2x pendek) saat OCR/barcode gagal terdeteksi — operator sering tidak menatap layar terus karena kerja di tripod.
- **Thumbnail strip** di kanan layar (overlay di atas camera preview): menampilkan 4 slot foto yang sudah diambil. Tap thumbnail → preview fullscreen + opsi retake (kembali ke step tersebut).

### Kegagalan step 3 — dua jenis, treatment beda

| Jenis gagal                                                | Sebab                                                              | Aksi UI                                                                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OCR reading gagal                                          | Foto blur/nomor mesin tidak terbaca sama sekali                    | Reposisi HP/objek, tekan volume lagi (retry foto)                                                                                                                       |
| API gagal (`GET /api/get-dealer` return `null` atau error) | Nomor mesin terbaca tapi tidak ada di database, atau network error | Foto TIDAK perlu diulang — tampilkan pesan spesifik ("Nomor mesin XXX tidak ditemukan"), beri opsi edit manual nomor mesin (kemungkinan typo OCR) sebelum hit API ulang |

### Fallback manual

Jika OCR/barcode gagal berulang kali (misal >3 percobaan atau setelah beberapa detik), munculkan opsi input manual (ketik langsung nomor mesin/BPKB) agar operator tidak stuck.

---

## 6. Capture & Image Processing Pipeline

Pipeline ini seragam untuk **semua** foto still-capture (step 1–4) — ini pada dasarnya document scanner bergaya CamScanner (grayscale → blur → edge detection → contour → crop → enhance), diterapkan ke tiap halaman. Step 5 (barcode) tidak masuk pipeline ini karena tidak menghasilkan foto (lihat Bagian 5).

**STATUS 30 Juli 2026: langkah 1, 2, 4, 5, 6 di bawah SUDAH diimplementasikan** ([src/utils/documentScanner.ts](src/utils/documentScanner.ts), dipanggil dari [src/components/PedalCamera.tsx](src/components/PedalCamera.tsx)) **tapi langkah 3 (perspective warp) SENGAJA DISEDERHANAKAN jadi crop bounding-box saja** (axis-aligned, tanpa koreksi skew/rotasi) — lihat Bagian 11 untuk alasan teknisnya. Belum diverifikasi runtime di device.

1. Tombol volume ditekan → capture foto **full-resolution still** (bukan crop dari preview kecil — preview resolusinya rendah demi performa real-time).
2. Jalankan contour/border detection pada foto full-res via `react-native-fast-opencv` **post-capture** (bukan pakai koordinat overlay preview — overlay preview yang jalan sekarang cuma statis, tidak ada live contour tracking, lihat Bagian 5).
3. ~~Ambil 4 titik sudut dokumen dari situ → perspective warp jadi rectangle lurus.~~ **Diganti:** crop ke bounding-box kontur terbesar (axis-aligned, bukan perspective warp 4-titik) — lihat Bagian 11 untuk alasan.
4. **Fallback wajib:** kalau contour 4-sisi gagal terdeteksi dengan baik (background rame, bayangan, dsb), JANGAN block proses — pakai foto original tanpa crop, tandai kecil di UI "border tidak terdeteksi". Throughput ribuan/hari tidak boleh berhenti menunggu foto sempurna.
5. **Enhance "scan look":** dokumen resmi (BPKB/STNK) punya cap/tanda tangan warna yang harus tetap terlihat — **jangan pakai mode B&W/threshold murni** yang bisa menghilangkan detail warna cap. Pakai mode color-enhance (naikkan kontras & brightness, putihkan background) sebagai default.
6. **Kompresi sebelum upload:** `doc/API.md` mendokumentasikan batas **max 1048 KB (~1 MB) per file**, tapi per konfirmasi langsung user (30 Juli 2026), **backend saat ini nyatanya tidak menerapkan validasi ukuran** — kemungkinan dokumentasi sudah tidak sinkron dengan behavior backend. Tetap kompresi wajar di device (bukan lagi demi lolos validasi, tapi demi kecepatan upload & ukuran PDF akhir yang wajar). **Bug ditemukan:** `compressImage()` di [src/utils/imageCompressor.ts](src/utils/imageCompressor.ts) default `maxSizeMB=4.5`, dipanggil tanpa override di [src/api/endpoints.ts](src/api/endpoints.ts) — perlu diselaraskan ke target yang wajar (misal ~1–2MB) saat step ini diimplementasi.

---

## 7. Kontrak API Backend (SUMBER KEBENARAN — jangan mengarang endpoint lain)

Base URL harus configurable (env/config), jangan hardcode. Semua request wajib header `SECRET-KEY: {key}` (alternatif: query param `?secret_key=`).

### 7.1 `GET /api/get-dealer` — dipanggil di step 3 setelah OCR

Query: `nomesin` (string, required).

Response sukses:

```json
{ "fk_dealer": "DLR001", "nm_dealer": "Menara Agung Jakarta" }
```

Response tidak ketemu: `null` (bukan 404 — tetap HTTP 200 dengan body `null`).

> **Catatan penting untuk implementasi:** endpoint ini dipakai untuk _validasi_ nomor mesin ketemu/tidak sebelum lanjut ke step 4. `fk_dealer`/`nm_dealer` yang didapat **tidak punya field tujuan di endpoint upload (7.2)**, dan **dikonfirmasi user (30 Juli 2026, lihat Bagian 10)**: murni ditampilkan ke operator sebagai konfirmasi visual ("benar, ini dealer X"), lalu dibuang — tidak perlu disimpan lokal.

### 7.2 `POST /api/bpkb/process` — final submit setelah step 4 selesai

Content-Type: `multipart/form-data`.

| Field     | Type   | Wajib | Validasi                                                    |
| --------- | ------ | ----- | ----------------------------------------------------------- |
| `nomesin` | string | Ya    | max 16 karakter, harus ada di `pgsql_nms.stokunit.no_mesin` |
| `nobpkb`  | string | Ya    | max 20 karakter                                             |
| `images`  | file[] | Ya    | **harus tepat 4 file**, jpeg/png/jpg, max 1 MB per file     |

> **Catatan penting (final, dikonfirmasi user 30 Juli 2026):** `images[]` = 4 halaman resmi BPKB, BUKAN termasuk barcode (step 5 tidak menghasilkan foto). Urutan: `images[0]`=Hal 1 Identitas Pemilik, `images[1]`=Hal 2 Identitas Kendaraan, `images[2]`=Hal 3 Identitas Kendaraan Lanjutan (foto yang sama juga jadi sumber OCR nomor mesin), `images[3]`=Hal 4 Dokumen Persyaratan.

Response sukses (202 Accepted):

```json
{ "message": "BPKB sedang diproses.", "track_id": "a1b2c3d4-..." }
```

Response gagal validasi (422):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nomesin": ["Nomor Mesin tidak ditemukan di database."],
    "images": ["Harus mengunggah tepat 4 gambar."]
  }
}
```

### 7.3 `GET /api/bpkb/track/{track}` — polling status

Path param `track` (UUID) dari response 7.2. Field respons: `stage` (`pending`|`create_pdf`|`update_stok_unit`|`update_tgl_bpkb_siap`|`completed`), `status` (`queued`|`processing`|`completed`|`failed`), `pdf_path`, `error_message`, dll — field lengkap ada di API.md asli, jangan reproduksi ulang di sini untuk hindari drift, cek file sumber.

### 7.4 `GET /api/bpkb/track/{track}/stream` — SSE alternatif polling

Event `data:` berisi `{stage, status, pdf_url, error_message}`. Stream otomatis berhenti saat `status` = `completed`/`failed`. **Ini pilihan lebih baik dibanding polling manual** untuk layar "sedang diproses" setelah submit — hemat request, real-time.

### 7.5 `GET /api/activity` — dashboard ringkasan bulanan

`{ target_bpkb, completed_bpkb, pending_bpkb }`. Kemungkinan dipakai di layar home/dashboard app (di luar flow scan 4-step), bukan bagian dari flow capture itu sendiri.

---

## 8. Mapping State Lokal → API

| State di app          | Diisi dari                                                            | Dikirim ke                                |
| ---------------------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| `photoPemilik`         | Step 1 "Identitas Pemilik" capture (crop + enhance)                    | `images[0]` di 7.2                        |
| `photoKendaraan`       | Step 2 "Identitas Kendaraan" capture (crop + enhance)                  | `images[1]` di 7.2                        |
| `photoKendaraanLanjut` | Step 3 "Identitas Kendaraan Lanjutan" capture (crop + enhance) — **foto yang sama juga jadi sumber OCR**, satu capture dua guna | `images[2]` di 7.2 |
| `nomesin` (text)       | Hasil OCR dari foto step 3 di atas                                     | Field `nomesin` di 7.2 (dan query di 7.1) |
| `dealerInfo`           | Response 7.1                                                           | **Display-only**, tampilkan lalu buang (dikonfirmasi user 30 Juli 2026), lihat catatan di 7.1 |
| `photoPersyaratan`     | Step 4 "Dokumen Persyaratan" capture (crop + enhance) — foto polos     | `images[3]` di 7.2                        |
| `nobpkb` (text)        | Hasil decode barcode step 5 — **teks saja, step 5 TIDAK menghasilkan foto** | Field `nobpkb` di 7.2                 |
| `trackId`              | Response 7.2                                                           | Dipakai untuk polling 7.3 / SSE 7.4       |

> Urutan & nama halaman `images[0..3]` dikonfirmasi langsung oleh user 30 Juli 2026 mengikuti struktur resmi BPKB (lihat catatan Bagian 5 & 7.2) — final, bukan asumsi lagi.

---

## 9. Layar Setelah Submit

Setelah `POST /api/bpkb/process` sukses (202), tampilkan layar progres yang subscribe ke SSE endpoint (7.4). Tampilkan `stage` saat ini secara human-readable (map ke Bahasa Indonesia: `create_pdf` → "Membuat PDF", `update_stok_unit` → "Menyimpan data unit", dst). Kalau `status: failed`, tampilkan `error_message` apa adanya + opsi kembali ke home (bukan retry otomatis, karena kemungkinan submit ulang butuh foto ulang juga).

---

## 10. Open Questions — Resolusi (hasil diskusi 30 Juli 2026)

Semua 4 pertanyaan asli sudah dijawab langsung oleh user. Dicatat di sini sebagai riwayat keputusan (bukan lagi open), detail penerapannya ada di bagian yang dirujuk masing-masing.

1. ~~Apakah `fk_dealer`/`nm_dealer` dari step 3 perlu disimpan lokal...~~ → **Tampilkan lalu buang.** Tidak perlu state/tabel lokal tambahan. (Bagian 7.1, 8)
2. ~~Urutan `images[]` di `POST /api/bpkb/process`...~~ → **Final: 4 halaman resmi BPKB** (Identitas Pemilik, Identitas Kendaraan, Identitas Kendaraan Lanjutan +OCR, Dokumen Persyaratan), barcode (step 5) tidak menghasilkan foto sama sekali. (Bagian 5, 7.2, 8)
3. ~~Requirement retry/resume kalau app crash...~~ → **Tidak perlu.** Kalau crash/force-close di tengah proses, operator ulang dari awal (redo 4 foto) — dianggap lebih sederhana daripada mekanisme resume untuk tool internal throughput tinggi.
4. ~~Nomor mesin & nomor BPKB disimpan draft lokal...~~ → **Tidak perlu**, sejalan dengan poin 3 — tidak ada draft/jeda-lalu-lanjut, submit dianggap satu sesi penuh.

Keputusan tambahan yang muncul di sesi yang sama (bukan dari daftar asli, tapi sama pentingnya): **pin `react-native-vision-camera` ke v4.7.2** dan penggantian `react-native-document-scanner-plugin` → `react-native-fast-opencv` — lihat Bagian 3 untuk detail dan alasannya.

Item yang sempat dianggap "masih terbuka" (sifat foto ke-4) sudah **resolved**: itu bukan foto identitas generik, tapi halaman resmi BPKB "Dokumen Persyaratan", foto polos — lihat Bagian 5 & 8.

---

## 11. Status Migrasi & Langkah Selanjutnya (WAJIB DIBACA — update 30 Juli 2026)

Dokumen ini semula ditulis dengan asumsi "belum ada kode" — itu salah, lalu migrasi dari kode existing sudah **dikerjakan penuh** dalam sesi yang sama (30 Juli 2026). Bagian ini adalah **status akhir sesi tersebut**. Sesi berikutnya (device berbeda) mulai dari sini.

### Ringkasan super singkat
- Semua kode sudah ditulis, lolos `tsc` + `gradlew assembleDebug`.
- **Belum pernah dijalankan di device fisik sama sekali** — tidak ada emulator/HP yang terhubung sepanjang sesi kemarin.
- **Tugas #1 sesi ini: colok HP via USB (aktifkan USB debugging), jalankan `npx react-native start` + `npx react-native run-android` (atau build dari Android Studio), lalu susuri manual step 1 → step 5 → submit → layar tracking.**
- Area paling berisiko meleset saat dites (urutan cek yang disarankan): (1) permission dialog kamera muncul & capture jalan di `PedalCamera.tsx`, (2) hasil crop `documentScanner.ts` masuk akal secara visual — bukan gambar rusak/area salah, (3) OCR+`getDealer` di step 3 masih akurat, (4) live barcode scan (`useCodeScanner`) di step 5 benar-benar mendeteksi barcode real, (5) upload akhir ke backend sukses dengan `images[]` yang benar.

### File yang sudah diubah sesi ini (state SEKARANG, bukan lagi rencana)

| File | State sekarang |
| --- | --- |
| [android/app/src/main/java/com/mabpkb/MainActivity.kt](android/app/src/main/java/com/mabpkb/MainActivity.kt) | **Tidak diubah** — native volume-button module sudah benar dari awal, override `dispatchKeyEvent`, emit `onHardwareKeyPress` dengan payload `{key: 'volumeUp'\|'volumeDown'}`. |
| [src/contexts/PedalContext.tsx](src/contexts/PedalContext.tsx), [src/hooks/useHardwareKey.ts](src/hooks/useHardwareKey.ts) | **Tidak diubah** — masih dipakai apa adanya. |
| [src/components/PedalCamera.tsx](src/components/PedalCamera.tsx) | **SUDAH migrasi ke `react-native-vision-camera` 4.7.2** (`useCameraDevice`, `useCameraPermission`, `takePhoto()`). Setelah capture, foto langsung diproses lewat `processScanImage()` (`documentScanner.ts`) sebelum dikirim ke `onCapture`. Props publik (`filename`, `onCapture`, `overlayVariant`) TIDAK berubah, jadi 3 pemanggil lain tidak perlu disentuh. |
| [src/components/DocumentOverlay.tsx](src/components/DocumentOverlay.tsx) | **Tidak diubah** — masih overlay statis lama (dim + cutout box + border pulsing). Live contour tracking sengaja di-defer (lihat "Yang sengaja belum dikerjakan" di bawah). |
| [src/components/PhotoCaptureStep.tsx](src/components/PhotoCaptureStep.tsx) | **Tidak diubah** — masih dipakai step 1, 2, dan (state baru) step 4. |
| [src/contexts/ScanContext.tsx](src/contexts/ScanContext.tsx) | **Tidak diubah.** Field `photo3` sekarang secara konseptual = foto Hal 3 (OCR source), `photo4` = foto Hal 4 (Dokumen Persyaratan) — cuma soal isi, nama field state tetap sama. |
| [src/screens/scan/ScanStep1Screen.tsx](src/screens/scan/ScanStep1Screen.tsx), [ScanStep2Screen.tsx](src/screens/scan/ScanStep2Screen.tsx) | **Judul diperbarui** ke "Identitas Pemilik"/"Identitas Kendaraan". Logic tidak berubah. |
| [src/screens/scan/ScanStep3Screen.tsx](src/screens/scan/ScanStep3Screen.tsx) | **DITULIS ULANG TOTAL** — sekarang berisi logic OCR+`getDealer` (dipindah dari ScanStep4Screen lama), simpan ke `setPhoto3`, navigasi ke `ScanStep4` setelah sukses. Judul "Identitas Kendaraan Lanjutan". |
| [src/screens/scan/ScanStep4Screen.tsx](src/screens/scan/ScanStep4Screen.tsx) | **DITULIS ULANG TOTAL** — sekarang jadi capture polos sederhana (pola `PhotoCaptureStep`, sama seperti step 1/2), `setPhoto4`, judul "Dokumen Persyaratan", navigasi ke `ScanStep5`. |
| [src/screens/scan/ScanStep5Screen.tsx](src/screens/scan/ScanStep5Screen.tsx) | **DITULIS ULANG TOTAL** — barcode sekarang pakai `useCodeScanner` (vision-camera v4, live-scan langsung dari `<Camera codeScanner={...}>`), BUKAN lagi `@react-native-ml-kit/barcode-scanning` still-image. Input manual selalu tersedia (bukan cuma muncul setelah gagal). Titik submit final (`processBpkb`) tidak berubah lokasinya. |
| [src/screens/scan/ReviewScreen.tsx](src/screens/scan/ReviewScreen.tsx) | **DIHAPUS** (dead code, tidak pernah dinavigasi). Referensinya juga sudah dibuang dari `ScanStack.tsx` dan `ScanStackParamList` di `types.ts`. |
| [src/utils/noMesin.ts](src/utils/noMesin.ts) | **Tidak diubah**, cuma dipindah konteks pemanggilannya ke `ScanStep3Screen.tsx`. |
| [src/utils/documentScanner.ts](src/utils/documentScanner.ts) | **FILE BARU.** Fungsi `processScanImage(uri)` — deteksi border + crop bounding-box + enhance kontras/brightness, pakai `react-native-fast-opencv`. Lihat peringatan API di bawah sebelum menyentuh file ini lebih lanjut. |
| [src/utils/imageCompressor.ts](src/utils/imageCompressor.ts) | Tidak diubah. |
| [src/api/endpoints.ts](src/api/endpoints.ts) | **Bug diperbaiki** — `compressImage(img.uri, img.name, 1)` sekarang eksplisit target 1MB (sebelumnya default 4.5MB tanpa override). |
| `babel.config.js` | **Ditambah** `react-native-worklets-core/plugin` (untuk dependency vision-camera v4), berdampingan dengan `react-native-worklets/plugin` yang sudah ada. |
| `package.json` | Ditambah: `react-native-vision-camera@^4.7.2`, `react-native-worklets-core@^1.6.3`, `react-native-fast-opencv@^1.0.0`. Dicopot: `react-native-camera-kit`, `@react-native-ml-kit/barcode-scanning`. |

### Blast radius exact (snapshot SEBELUM migrasi, 30 Juli 2026 — untuk referensi historis; state SEKARANG ada di tabel "File yang sudah diubah sesi ini" di atas)

**`react-native-camera-kit`** — cuma di 1 file:
- `src/components/PedalCamera.tsx:3` — `import {Camera, CameraType} from 'react-native-camera-kit';`
- `src/components/PedalCamera.tsx:4` — `import type {CameraApi} from 'react-native-camera-kit';`
- `src/components/PedalCamera.tsx:27,91` — pemakaian `CameraApi`/`CameraType.Back`

**`@react-native-ml-kit/barcode-scanning`** — cuma di 1 titik:
- `src/screens/scan/ScanStep5Screen.tsx:10` — import
- `src/screens/scan/ScanStep5Screen.tsx:104` — `await BarcodeScanning.scan(img.uri)`

Pemanggil `<PedalCamera .../>` yang TIDAK PERNAH menyentuh `react-native-camera-kit` langsung (cuma pakai props di atas) — kalau props `PedalCamera` dipertahankan, 3 file ini **tidak perlu diubah sama sekali** untuk urusan swap kamera:
- `src/components/PhotoCaptureStep.tsx:8,60` (dipakai step 1, 2, 4)
- `src/screens/scan/ScanStep3Screen.tsx` (lewat `PhotoCaptureStep`, akan diubah total untuk urusan OCR, bukan kamera)
- `src/screens/scan/ScanStep5Screen.tsx:21,171`

### Dependency check — riwayat (30 Juli 2026)

Sebelum instalasi, dicek dulu: **tidak ada** `react-native-vision-camera`, `react-native-fast-opencv`, `react-native-worklets-core` yang terpasang sama sekali (langsung maupun transitif) — instalasi bersih, tidak ada konflik versi parsial. **Setelah sesi ini, ketiganya SUDAH terpasang** (lihat tabel `package.json` di atas) — kalau sesi baru menjalankan `npm install` dulu (misal setelah clone/pull), semua dependency ini akan otomatis terpasang dari `package.json`/`package-lock.json`, tidak perlu instal manual lagi. `@shopify/react-native-skia` sengaja TIDAK dipakai/diinstal (lihat alasan di bagian frame-processor di bawah).

### Gotcha instalasi Android untuk vision-camera — SUDAH DIVERIFIKASI 30 Juli 2026

- `./gradlew assembleDebug` **BUILD SUCCESSFUL** setelah install `react-native-vision-camera@4.7.2` + `react-native-worklets-core@1.6.3` + babel plugin `react-native-worklets-core/plugin`. APK debug ter-generate normal.
- Manifest hasil merge (`android/app/build/intermediates/merged_manifest/debug/processDebugMainManifest/AndroidManifest.xml`) dicek: **`RECORD_AUDIO` TIDAK ikut ditarik** oleh vision-camera 4.7.2 untuk penggunaan foto-saja (`photo={true}`, tanpa `video={true}`). Kekhawatiran sebelumnya tidak terbukti — tidak perlu `tools:node="remove"` atau `xmlns:tools`.
- `npx tsc --noEmit` bersih setelah swap kamera (`PedalCamera.tsx`) dan barcode (`ScanStep5Screen.tsx` ke `useCodeScanner`).
- **Catatan:** ini baru verifikasi COMPILE-TIME (native build + types). Belum ada verifikasi RUNTIME di device sungguhan (tidak ada device/emulator terhubung saat ini) — capture foto, permission dialog, dan live barcode scan tetap perlu dites manual di HP asli sebelum dianggap selesai.

### Komponen pendukung yang dipakai scan flow — JANGAN diubah signature-nya, tinggal reuse

- `ScanStepIndicator` ([src/components/ScanStepIndicator.tsx](src/components/ScanStepIndicator.tsx)): props `{currentStep: number; totalSteps: number}` — dot/line stepper, tidak ada coupling ke kamera.
- `ScanFeedback` ([src/components/ScanFeedback.tsx](src/components/ScanFeedback.tsx)): props `{type: 'success'|'error'|'result'; message: string; visible: boolean}`.
- `useAlert()` ([src/contexts/AlertContext.tsx](src/contexts/AlertContext.tsx)): `{showAlert(options), showConfirm(message, onConfirm, title?), hideAlert()}` — harus dipanggil di dalam `<AlertProvider>` (sudah dipasang di `App.tsx`).
- `useSound()` ([src/hooks/useSound.ts](src/hooks/useSound.ts)): `{play(pattern?: 'success'|'error'|'submit')}` — pakai `react-native-sound`, **berbeda library** dari yang mungkin dipakai `PedalCamera` untuk feedback capture-nya sendiri (cek dulu sebelum asumsi keduanya sama).
- `ScanStackParamList` ([src/navigation/types.ts](src/navigation/types.ts)): kelima route (`ScanStep1..5` — `Review` sudah dihapus) semuanya `undefined` params — state lewat `ScanContext`, bukan route params. Tidak perlu diubah kecuali menambah/menghapus route.
- `TrackStatusScreen` + `useBpkbStream` ([src/screens/track/TrackStatusScreen.tsx](src/screens/track/TrackStatusScreen.tsx), [src/hooks/useBpkbStream.ts](src/hooks/useBpkbStream.ts)): **Bagian 9 SUDAH terimplementasi penuh dan benar** — pakai `EventSource` dari `react-native-event-source` (bukan fetch/XHR), auto-disconnect saat `completed`/`failed`, render 5-stage stepper. Satu detail sengaja beda dari `client.ts`: secret key dikirim via **query param** `?secret_key=` di URL stream, bukan header `SECRET-KEY` — ini BENAR dan disengaja (spec `EventSource` browser/RN tidak mendukung custom header, makanya endpoint 7.4 sendiri menyediakan fallback query param di Bagian 7). **Jangan "diperbaiki" jadi header**, itu akan merusak koneksi SSE.

### PERINGATAN KERAS: Context7 untuk react-native-fast-opencv SALAH VERSI (ditemukan 30 Juli 2026)

Dokumentasi Context7 untuk `react-native-fast-opencv` (dipakai riset di Bagian 3) menunjukkan API gaya dispatcher: `OpenCV.invoke('cvtColor', ...)`, `OpenCV.createObject(ObjectType.Mat, ...)`, `OpenCV.toJSValue(...)`, `OpenCV.clearBuffers()`. **Ini SALAH untuk versi yang ter-install (1.0.0 dari npm, 30 Juli 2026)** — dibuktikan langsung oleh `tsc` yang menolak semua pemanggilan itu (`Property 'invoke' does not exist on type 'OpenCVModel'`, dst).

API asli versi 1.0.0 (dikonfirmasi dari `node_modules/react-native-fast-opencv/lib/typescript/src/**/*.d.ts` langsung, bukan Context7):
- Objek (`Mat`, `Point`, `Rect`, `Size`, `MatVector`, `PointVector`, dst) adalah **class dengan static factory method**: `Mat.create(rows?, cols?, dataType?, data?)`, `Mat.createFromBase64(base64)`, `Rect.create(x,y,w,h)`, `Size.create(w,h)`, `MatVector.create()`. Instance punya method sendiri: `.release()`, `.rows`/`.cols`, `.toBase64()`, `.saveToFile(path)`, `.get(index)`/`.push(item)`/`.length` untuk vector.
- Fungsi pemrosesan (`cvtColor`, `GaussianBlur`, `Canny`, `findContours`, `contourArea`, `boundingRect`, `crop`, `convertScaleAbs`, dst) dipanggil **langsung sebagai method di `OpenCV`**: `OpenCV.cvtColor(src, dst, code)`, BUKAN lewat `.invoke('cvtColor', ...)`.
- Tidak ada `OpenCV.toJSValue()` global — `Rect`/`Point` punya property `.x`/`.y`/`.width`/`.height` langsung sebagai instance property.
- Tidak ada `OpenCV.clearBuffers()` global — tiap object di-release satu-satu lewat `.release()`.

**Pelajaran untuk coding agent mana pun yang lanjut kerjakan project ini:** kalau Context7/web search untuk library apapun menunjukkan pola API yang terasa "generic dispatcher" (nama fungsi sebagai string ke satu method umum), **JANGAN percaya begitu saja** — buka langsung file `.d.ts` di `node_modules/<package>/**/*.d.ts` dari versi yang BENAR-BENAR ter-install, dan jalankan `npx tsc --noEmit` segera setelah menulis kode yang memanggilnya. Ini satu-satunya cara mendeteksi drift dokumentasi-vs-realita sebelum runtime.

Implementasi final ada di [src/utils/documentScanner.ts](src/utils/documentScanner.ts) — **sengaja disederhanakan jadi crop bounding-box** (bukan perspective-warp 4-titik penuh), karena fungsi-fungsi untuk perspective-warp (`getPerspectiveTransform`, `warpPerspective`, `PointVector` construction dari titik hasil `approxPolyDP`) butuh instance method chaining yang lebih kompleks dan belum bisa diverifikasi tanpa device asli. Fallback ke foto asli kalau contour tidak ditemukan atau OpenCV gagal — tidak pernah melempar error yang mem-block capture.

**Status verifikasi:** lolos `npx tsc --noEmit` DAN `./gradlew assembleDebug` (BUILD SUCCESSFUL, native module `react-native-fast-opencv` ter-link dengan benar, dicek 30 Juli 2026). **BELUM diverifikasi runtime** — perilaku sesungguhnya dari `findContours`/`contourArea`/`boundingRect`/`crop`/`convertScaleAbs`/`saveToFile` pada foto asli baru bisa dipastikan setelah dites capture langsung di HP. Kalau hasil crop terlihat salah (misal area terpotong tidak masuk akal), cek dulu asumsi bahwa `MatVector` dari `findContours` berisi satu `Mat` per kontur yang bisa langsung dipakai `contourArea`/`boundingRect` — itu asumsi paling berisiko di implementasi ini.

### Yang sengaja belum dikerjakan (bukan lupa — keputusan sadar, lihat alasan di bagian sebelumnya)

1. **Live contour overlay** (kotak/garis mengikuti tepi dokumen real-time di preview, sesuai deskripsi asli Bagian 5) — belum ada. Overlay yang jalan masih statis (`DocumentOverlay.tsx` lama). Kalau mau dikerjakan: pertimbangkan `useFrameProcessor` (v4) atau primitif `<SkiaCamera>` kalau nanti pindah ke v5 — tapi JANGAN mulai ini sebelum langkah 1 di "Langkah selanjutnya" (uji device) selesai duluan, supaya kalau ada bug tidak tertumpuk 2 lapis perubahan belum-teruji.
2. **Perspective warp penuh** (koreksi skew/rotasi 4-titik, bukan cuma crop bounding-box) — lihat peringatan Context7-salah-versi di atas. Fungsi-fungsi OpenCV yang dibutuhkan (`getPerspectiveTransform`, `warpPerspective`, `PointVector` dari `approxPolyDP`) SUDAH terkonfirmasi ada di API asli library (lihat daftar di peringatan di atas), tinggal dirangkai — tapi lakukan ini SETELAH bounding-box crop yang sekarang terbukti jalan benar di device, supaya ada baseline pembanding kalau versi perspective-warp ternyata bermasalah.

### LANGKAH SELANJUTNYA (mulai dari sini di sesi/device baru)

1. **Colok HP Android via USB, aktifkan USB debugging, `adb devices` harus menampilkan device.** Kalau install dari clone/pull baru: `npm install` dulu (akan otomatis narik `react-native-vision-camera`, `react-native-worklets-core`, `react-native-fast-opencv` dari `package.json`).
2. Jalankan `npx react-native start` (Metro) di satu terminal, lalu `npx react-native run-android` di terminal lain (atau `npx react-native run-android --device` kalau ada lebih dari satu device/emulator).
3. **Uji manual end-to-end**, urutan sesuai daftar risiko di "Ringkasan super singkat" di atas. Kalau app crash saat buka kamera: cek dulu permission `CAMERA` di-grant (dialog harus muncul otomatis lewat `useCameraPermission`), lalu cek logcat (`adb logcat *:E`) untuk exception native asli — itu satu-satunya cara lihat error sungguhan dari vision-camera/OpenCV, JS error boundary tidak akan menangkapnya.
4. **Kalau hasil crop dari `documentScanner.ts` terlihat aneh** (area kepotong salah, gambar rusak, atau app hang lama saat capture): kemungkinan besar di asumsi bahwa `MatVector` hasil `findContours` bisa langsung dipakai `contourArea`/`boundingRect` per-elemen — cek dulu itu, jangan langsung asumsikan library-nya rusak. Fallback (`borderDetected: false`, pakai foto asli) HARUS tetap jalan walau bagian ini gagal — kalau app malah crash (bukan fallback), berarti ada exception yang lolos dari try/catch di `processScanImage`, perlu investigasi.
5. Setelah alur dasar terbukti jalan: pertimbangkan dua item "sengaja belum dikerjakan" di atas, urut sesuai prioritas operasional (live overlay = nice-to-have UX, perspective warp = kualitas hasil scan).
