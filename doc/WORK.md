> Setiap sesi wajib baca file ini sebelum mulai kerja.

## KAMERA: KEPUTUSAN FINAL (2026-07-28, sore)

**Semua eksperimen VisionCamera + OpenCV DIBATALKAN dan sudah dicopot.**
Arsitektur final: `react-native-camera-kit` + `PedalCamera` untuk semua 5 step.

### Alur final (5 step, semua dipedal, 0 sentuh layar)

| Step | Layar | Isi | Hasil |
|------|-------|-----|-------|
| 1 | ScanStep1Screen | pedal → foto | photo1 |
| 2 | ScanStep2Screen | pedal → foto | photo2 |
| 3 | ScanStep3Screen | pedal → foto | photo3 |
| 4 | ScanStep4Screen | pedal → foto → ML Kit OCR → `getDealer` | photo4 + nomesin + dealer |
| 5 | ScanStep5Screen | pedal → foto → ML Kit barcode → submit | nobpkb → `processBpkb` |

Step 1-3 memakai komponen bersama `src/components/PhotoCaptureStep.tsx` (jangan
duplikasi kode per step). Step 4 & 5 punya logika sendiri karena ada OCR/barcode.

Volume Bawah = jepret (via `PedalContext`). Volume Atas = ulang.

### ATURAN WAJIB: setiap pemulihan error harus bisa lewat PEDAL

Pedal hanya mengirim **Volume Bawah**. Volume Atas mengharuskan admin menyentuh HP,
padahal kedua tangannya memegang BPKB dan HP ada di tripod. Jadi setiap jalan keluar
dari kondisi gagal WAJIB terpasang di `volumeDown`. Kalau menaruhnya di `volumeUp`,
alurnya buntu di lapangan meskipun lolos di meja developer.

Pemetaan tombol saat ini:

| Layar | Fase | Volume Bawah (pedal) | Volume Atas |
|-------|------|----------------------|-------------|
| Step 1-3 | camera | jepret | — |
| Step 1-3 | done | — | ulang |
| Step 4 | camera | jepret | — |
| Step 4 | error | **foto ulang** | — |
| Step 4 | result | — | ulang |
| Step 5 | camera | jepret | — |
| Step 5 | confirm | **KIRIM** | ulang |
| Step 5 | scanError | **foto ulang** | — |
| Step 5 | submitError | **kirim ulang** | foto ulang |

### BUG KRITIS YANG SUDAH DIPERBAIKI di Step 5

Versi lama: barcode terbaca → timer 1,5 detik memanggil `handleDoublePress` (tekan ke-1)
→ fase `confirm` → menunggu tekan ke-2. Tapi **tidak ada `useHardwareKey` untuk
`volumeDown` sama sekali** di layar itu — satu-satunya yang terpasang adalah
`handleRetake` di `volumeUp`. Akibatnya `doSubmit` MUSTAHIL tercapai lewat pedal dan
data tidak pernah terkirim. Setelah 3 detik fase kembali ke `result` dan buntu.

Sekarang: barcode terbaca → langsung fase `confirm` yang menampilkan ringkasan
(No BPKB + No Mesin + Dealer) → satu tekan pedal = KIRIM. Mekanisme `pressCount` dan
timer 3 detik dibuang karena membingungkan dan jadi sumber bug. Fase gagal kirim
dipisah (`submitError`) dari gagal baca barcode (`scanError`) supaya pedal bisa
mengulang tindakan yang tepat: kirim ulang, bukan foto ulang.

### No Mesin: DIVERIFIKASI KE DATABASE, bukan ditebak regex

**Nomor mesin selalu diawali `JM`.** Contoh nyata: `JMF2E1774885` (JM + 3 karakter + 7 digit).

Regex lama `/[A-Z0-9]{8,16}/` mengambil kecocokan PERTAMA apa saja, sehingga menangkap
`DITLANTAS` dari teks BPKB lalu melaporkan "berhasil" dengan nomor yang salah.

Cara sekarang (`src/utils/noMesin.ts` + `ScanStep4Screen`):

1. Kumpulkan kandidat dari ML Kit per-elemen, per-baris, dan regex `JM[A-Z0-9]{6,15}`
   (menangkap kasus OCR memisah nomor dengan spasi)
2. Buang yang tidak masuk akal: panjang di luar 8-17, atau tidak mengandung huruf DAN angka
   (aturan ini yang membunuh `DITLANTAS`)
3. Urutkan: prefix `JM` +6, bentuk mesin +4, deret digit panjang +2, panjang 11-13 +2
4. Tambah varian perbaikan salah baca digit di EKOR saja (O→0, I→1, S→5, B→8, D→0, dst),
   5 karakter pertama tidak diutak-atik supaya prefix aman
5. **Adu setiap kandidat ke `getDealer()` sampai ada yang dijawab database.** Yang dijawab
   itulah nomor mesin yang benar — terbukti, bukan tebakan. Maksimal 8 percobaan.

`JM` dipakai sebagai PRIORITAS URUTAN, bukan penyaring mati — kalau suatu saat ada nomor
tanpa prefix JM, tetap ketemu, hanya dicoba belakangan. Database yang jadi hakim.

Penting: `getDealer` membedakan 3 keadaan dan ketiganya HARUS dibedakan —
mengembalikan objek (nomor valid), `null` (tidak ada di DB), atau melempar (jaringan gagal).
Jangan pernah `catch {}` kosong di sini seperti kode lama, karena gagal jaringan akan
disalahartikan sebagai "nomor tidak ditemukan".

Kalau tidak ada kandidat yang lolos, layar masuk mode input manual dengan kandidat terbaik
sudah terisi (admin tinggal mengoreksi, bukan mengetik dari nol), dan input manual pun
tetap diverifikasi ke database sebelum diterima.

Regresi dijaga `__tests__/noMesin.test.ts` (4 kasus, lulus semua). Jalankan: `npx jest`.
`@react-native/jest-preset` tadinya belum terpasang sehingga jest tidak bisa jalan sama
sekali — sekarang sudah.

### DILARANG (sudah dicoba dan gagal / tidak sepadan)

1. **`@dariyd/react-native-document-scanner` atau ML Kit Document Scanner apapun.**
   Membuka Activity milik Google Play Services → `dispatchKeyEvent` di `MainActivity.kt`
   tidak menjangkaunya dan tidak ada API shutter programatik → **pedal mustahil**.
   ML Kit yang BOLEH hanya `@react-native-ml-kit/text-recognition` dan
   `@react-native-ml-kit/barcode-scanning` — keduanya jalan di FILE gambar hasil
   jepretan, bukan UI sendiri.
2. **`@shopify/react-native-skia`.** Gagal compile di mesin Windows ini: 18 langkah
   compile dilaporkan sukses tapi hanya 1 file `.o` bertahan saat link.
3. **VisionCamera v5 + fast-opencv untuk deteksi tepi live.** Berfungsi sampai tahap
   barcode terdeteksi, tapi menuntut minSdk 26, 6 package native, dan pemetaan
   koordinat yang belum tuntas. Dibatalkan karena PDF dibuat server, bukan app —
   jadi auto-crop bukan tugas app dan deteksi live tidak sepadan biayanya.

### Konsekuensi yang diterima

Bingkai TIDAK mengikuti dokumen. `DocumentOverlay.tsx` adalah bingkai statis sebagai
panduan. Admin mengepaskan BPKB dengan berpatokan pada bingkai statis itu.

### Kondisi Android

- `minSdkVersion` kembali **24**
- `AndroidManifest.xml` tetap `android:screenOrientation="portrait"` (HP di tripod,
  tidak boleh berputar)
- `MainActivity.kt` `dispatchKeyEvent` **tetap dipakai** — ini inti pedal, jangan diutak-atik
- `react-native-volume-manager` masih terpasang tapi **tidak dipakai sama sekali**
  (`useVolumeKey.ts` sudah dihapus). Aman dicopot kapan saja.

### BELUM TERVERIFIKASI

- Belum dibuild ulang setelah penyederhanaan ini — **wajib rebuild native** karena ada
  package native yang dicopot dan minSdk berubah
- **Ukuran file hasil `camera-kit.capture()` belum diukur.** `API.md` mensyaratkan
  maksimal 1048KB per gambar dan tepat 4 gambar. camera-kit tidak memberi kontrol
  resolusi/kualitas seperti VisionCamera, jadi ini RISIKO NYATA — kalau lebih dari 1MB,
  upload akan kena 422 dan perlu kompresi sebelum kirim.
- Antrean offline SQLite (`flow.md`) belum ada. `ScanStep5` memanggil `processBpkb`
  langsung; kalau gagal hanya toast dan data hilang.

### Catatan build di mesin ini

- `npx react-native run-android` gagal: `'gradlew.bat' is not recognized`.
  Pakai: `cd android` lalu `.\gradlew.bat installDebug`, Metro dijalankan terpisah.
- Build native penuh ~12 menit

---

## RIWAYAT: eksperimen VisionCamera (2026-07-28, siang) — SUDAH DIBATALKAN

### Masalah yang ditemukan

`@dariyd/react-native-document-scanner` (dipakai ScanStep1-3 di commit `36f0e7c`) memanggil
**ML Kit Document Scanner**, yaitu Activity milik Google Play Services. Akibatnya:

- `dispatchKeyEvent` di `MainActivity.kt` TIDAK menjangkau Activity itu
- ML Kit Document Scanner tidak punya API shutter programatik
- Kesimpulan: **pedal mustahil di jalur ini**, admin wajib menyentuh HP

`DocumentOverlay.tsx` juga bukan deteksi tepi — itu bingkai statis dengan border pulsing.

### Kondisi pemakaian sebenarnya (dari user, 2026-07-28)

- HP di tripod, **sejajar kepala admin** — layar DILIHAT terus
- Kedua tangan admin memegang buku BPKB
- Kaki menekan pedal → pedal mengirim **Volume Bawah** ke HP
- Orientasi **portrait**, dikunci di manifest

Deteksi tepi karena itu BUKAN kosmetik — itu loop kontrol: mata lihat layar → tangan geser
BPKB → kaki tekan pedal saat posisi sudah pas. Barcode juga harus terdeteksi live agar
posisinya bisa dipaskan sebelum jepret.

### Stack kamera (terpasang)

| Package | Versi | Alasan |
|---------|-------|--------|
| `react-native-vision-camera` | 5.2.0 | Preview DI DALAM app → `dispatchKeyEvent` tetap jalan. `capturePhotoToFile()` programatik untuk pedal. `targetResolution`+`quality` memenuhi syarat max 1048KB di API.md |
| `react-native-nitro-modules` / `-image` | 0.36.3 / 0.15.1 | Wajib oleh VisionCamera v5 |
| `react-native-vision-camera-worklets` | 5.2.0 | Frame processor (`useFrameOutput`) |
| `react-native-vision-camera-resizer` | 5.2.0 | Downscale GPU ke 320x180, `scaleMode: 'stretch'` |
| `react-native-vision-camera-barcode-scanner` | 5.2.0 | Barcode live (ML Kit) + `cornerPoints` |
| `react-native-fast-opencv` | 1.0.0 | Deteksi tepi dokumen (Canny + findContours + approxPolyDP) |

**Skia DIBUANG.** `@shopify/react-native-skia` gagal compile di mesin Windows ini (object
file `.o` hilang saat link, 18 compile dilaporkan sukses tapi cuma 1 file bertahan).
Skia hanya dipakai untuk menggambar garis — diganti `react-native-svg` yang sudah ada.
JANGAN pasang ulang Skia.

### Pipeline koordinat (PENTING — jangan tebak rotasi)

Ada API resmi untuk konversi koordinat, tidak perlu menebak rotasi/cermin:

```
buffer 320x180 (OpenCV)
  -> skala ke frame:  x * (frame.width / 320), y * (frame.height / 180)
  -> frame.convertFramePointToCameraPoint(point)      // di worklet
  -> previewView.convertCameraPointToViewPoint(point) // di JS, via CameraRef
  -> koordinat view untuk <Polygon> react-native-svg
```

Barcode: `barcodeScanner.scanCodes(frame)` dipanggil di frame processor yang SAMA, jadi
`cornerPoints` sudah dalam ruang frame → masuk pipeline yang sama dari langkah 2.

`scaleMode: 'stretch'` dipilih agar buffer→frame adalah skala murni tanpa letterbox.
`convertCameraPointToViewPoint` throw kalau preview belum siap → wajib try/catch.

### Perubahan konfigurasi Android

- `android/build.gradle`: `minSdkVersion = 24` → **26** (dituntut `vision-camera-resizer`).
  `tools:overrideLibrary` TIDAK dipakai karena dokumentasinya sendiri memperingatkan
  "may lead to runtime failures".
- `AndroidManifest.xml`: tambah `android:screenOrientation="portrait"` — pemetaan koordinat
  bergantung orientasi, kalau layar berputar bingkai jadi kacau.

### File PoC

- `src/vision/detectDocumentQuad.ts` — worklet deteksi quad
- `src/components/DocumentScanCamera.tsx` — Camera + frame processor + overlay SVG + capture
- `src/screens/scan/ScanPocScreen.tsx` — layar uji, mode Dokumen/Barcode bisa diganti

`ScanStack` sementara `initialRouteName="ScanPoc"` — **WAJIB dibalikkan ke ScanStep1**
setelah PoC selesai.

### BELUM TERVERIFIKASI (jangan klaim beres)

- Belum pernah berhasil build & jalan di device sama sekali
- Ketepatan bingkai hijau menempel di BPKB belum pernah dilihat
- Ukuran file hasil `capturePhotoToFile` belum diukur terhadap batas 1048KB
- Keandalan deteksi tepi tergantung kontras BPKB vs alas — **alas gelap sangat dianjurkan**,
  alas terang membuat deteksi meleset/kedip. Ini faktor fisik, bukan kode.

### Catatan build di mesin ini

- `npx react-native run-android` gagal: `'gradlew.bat' is not recognized`. Bypass:
  `cd android; .\gradlew.bat installDebug` + `npx react-native start` terpisah
- Build native penuh ~12 menit

## STATUS TERKINI (2026-07-08 10:56)

### Sudah Selesai
- ✅ Design system (warna, font, images)
- ✅ API client (fetch + SECRET-KEY dari .env via react-native-config)
- ✅ Endpoint getDealer, processBpkb, trackBpkb
- ✅ SSE hook (useBpkbStream)
- ✅ Navigasi (bottom tab liquid glass + stack per tab)
- ✅ ScanContext (state antar screen scan flow)
- ✅ ScanIdentityScreen (foto 1 & 2)
- ✅ ScanNoMesinScreen (foto 3 + OCR + getDealer)
- ✅ ScanBarcodeScreen (foto 4 + barcode)
- ✅ ReviewScreen (review + submit /process)
- ✅ TrackStatusScreen (SSE realtime)
- ✅ HomeScreen (dashboard statistik — placeholder, belum integrate API)
- ✅ Lint ✅ TypeScript ✅
- ✅ LiquidGlassTabBar: pill shape active indicator, center button dynamic position, hidden on camera tab
- ✅ CollapsibleTopAppBar (M3 Expressive, Reanimated scroll-driven)
- ✅ TabNavContext (share setActiveTab antar komponen)
- ✅ Back button: ScanIdentity & Batch → back ke Home tab via BackHandler + header back arrow
- ✅ SECRET-KEY: hapus hardcoded, baca dari .env via Config.SECRET_KEY
- ✅ TabIcons: HomeIcon, CameraIcon, BatchIcon, BackIcon, SearchIcon, NotificationIcon, MoreIcon

### Belum Dikerjakan (Prioritas)
- ⏳ **[TINGGI] HomeScreen redesign: progress bar hero + 2 stat cards + CTA "Mulai Scan" + pull-to-refresh + CollapsibleTopAppBar**
- ⏳ **[TINGGI] TrackStatusScreen redesign: stepper progress 4 tahap + tombol "Buka PDF" + CollapsibleTopAppBar + refresh action**
- ⏳ **[SEDANG] endpoints.ts: tambah `getActivity()` → GET /api/activity**
- ⏳ Testing di device fisik
- ⏳ Error handling lebih robust (retry, offline state)
- ⏳ UI polish (loading shimmer, empty state, dll)

### Build Info
- Gradle: `org.gradle.jvmargs=-Xmx1536m` (sesuaikan RAM)
- Build command: `npx react-native run-android`
- Device: fisik (bukan emulator)
- Environment: VS Code + Chrome (hemat RAM)

## TECH STACK

- react-native 0.86.0
- react 19.2.3
- typescript ^5.8.3
- Node engine >= 22.11.0
- **Platform: Android only (tidak pakai iOS)**

## Code Style

- Komentar `//` DILARANG kecuali untuk hal yang benar-benar tidak obvious
- Tidak ada komentar dekoratif, komentar penjelasan baris per baris, atau komentar yang hanya mengulang kode
- Standar industri internasional, clean code, Partial, tidak menumpuk dalam 1 File.
- Method dan variable names harus self-explanatory — tidak perlu komentar jika nama sudah jelas

## Referensi & Keputusan

- WAJIB gunakan MCP Context7 untuk semua referensi dokumentasi React Native
- DILARANG asumsi package tanpa verifikasi via Context7 dan ke User
- Jika tidak yakin → cek Context7 dulu, baru kode
- Wajib Membuat Variable Global Agar bisa digunakan di file-file lain.
- Wajib Mengikuti Skills react-native-best-practices.
- Untuk UI UX wajib gunakan skills ui-ux-pro-max dan frontend-design

## md Maintenance

- WAJIB update `md` setiap selesai mengerjakan sesuatu
- Tambahkan keputusan arsitektur penting yang dibuat selama sesi
- Tujuan: sesi berikutnya baca md dan langsung paham tanpa perlu dijelaskan ulang
- Jika md sudah dibaca tapi masih bertanya hal yang sudah tercatat → itu bug, bukan fitur

## Anti-Halusinasi

- Jangan pernah jawab "sudah beres" jika belum diverifikasi jalan
- Jika ragu terhadap versi package → cek Context7, jangan tebak
- Setiap keputusan yang dibuat wajib bisa dirujuk ke dokumentasi atau dokumen requirement

## Rencana Implementasi API (Android)

Berdasarkan API.md, step yang perlu diimplementasi:

| Step | Endpoint | Auth | Fungsi | Status |
|------|----------|------|--------|--------|
| 1 | `GET /api/get-dealer?nomesin=...` | SECRET-KEY header | Ambil nama dealer | ✅ |
| 2 | `POST /api/bpkb/process` | SECRET-KEY header | Upload 4 foto + nomesin + nobpkb (multipart) | ✅ |
| 3 | `GET /api/bpkb/track/{id}` | SECRET-KEY header | Cek status proses (polling) | ✅ |
| 4 | `GET /api/bpkb/track/{id}/stream` | SECRET-KEY query param | SSE realtime tracking | ✅ |
| 5 | `GET /api/activity` | SECRET-KEY header | Ringkasan aktivitas BPKB bulanan | ⏳ belum |

## Notes & Saran

- Auth token belum di-protect endpoint `/api/bpkb/process` — backend perlu tambahkan ke Sanctum middleware nanti
- Endpoint `GET /get-ready-pdfs` dan `POST /pdf-downloaded` belum ada di API.md — nyusul, abaikan dulu
- Opsi error handling Android (saat queue job gagal):
  - A. Fire & forget — Android hapus setelah 202, terima resiko
  - B. Android simpan track_id, polling sampai completed baru hapus
  - C. Fire & forget + server alarm — admin monitor dari dashboard, manual retry
  - **Keputusan: ikuti API.md dulu, bahas nanti jika perlu**
- `nobpkb` tidak ada validasi `exists` di backend — sesuai API.md saja, perbaiki nanti jika miss
- **Tidak pakai login** — API pakai `SECRET-KEY` header (fixed value)
- **SSE** untuk realtime tracking via `react-native-event-source`

## Design System

### Warna

| Token | Hex | Kegunaan |
|-------|-----|----------|
| primary | `#002366` | Navy — header, CTA, accent utama |
| onPrimary | `#FFFFFF` | Teks di atas primary |
| secondary | `#f1f5f9` | Background card, surface |
| tertiary | `#f1f5f9` | Surface alternatif |
| neutral | `#0f172a` | Teks utama, foreground |
| background | `#F8FAFC` | Background utama app |
| border | `#E4E5E7` | Border, divider |
| destructive | `#DC2626` | Error, hapus |

### Font (Poppins + Open Sans)

| Fungsi | File | Weight |
|--------|------|--------|
| Heading | `Poppins-SemiBold.ttf` | 600 |
| Heading Bold | `Poppins-Bold.ttf` | 700 |
| Body | `OpenSans-Regular.ttf` | 400 |
| Body Medium | `OpenSans-Medium.ttf` | 500 |
| Body SemiBold | `OpenSans-SemiBold.ttf` | 600 |

Lokasi: `src/assets/fonts/Poppins/` dan `src/assets/fonts/Open_Sans/`

### Struktur Constants

```
src/constants/
├── index.ts      (export semua)
├── colors.ts     (Colors)
├── fonts.ts      (Fonts)
└── images.ts     (Images)
```

Import: `import {Colors, Fonts, Images} from '../constants';`

### Images

| Key | File |
|-----|------|
| lgHondaKecil | `lg_honda_kecil.jpg` |
| lgHonda | `lg_honda.webp` |
| logoMD | `logomd.png` |
| maLogo | `malogo.png` |

Lokasi: `src/assets/images/`

### Font Linking

`react-native.config.js` sudah dibuat. Font sudah di-link via `npx react-native-asset`.

### Package Terinstall

| Package | Fungsi |
|---------|--------|
| `react-native-config` | Baca `.env` file |
| `@react-navigation/native` | Navigasi core |
| `@react-navigation/native-stack` | Stack navigator |
| `react-native-screens` | Native screen (performa) |
| `react-native-event-source` | SSE realtime tracking |
| `@react-navigation/bottom-tabs` | Bottom tab navigator |
| `react-native-reanimated` | Animasi tab bar |
| `react-native-svg` | Ikon SVG tab bar |

### Konfigurasi

- `.env` → `API_BASE_URL=https://aciax.menara-agung.com` + `SECRET-KEY=U2Fsd...`
- `.env` sudah ditambahkan ke `.gitignore`
- `android/app/build.gradle` → sudah tambah `dotenv.gradle`
- Type declaration: `src/types/react-native-config.d.ts` (include `API_BASE_URL`, `SECRET_KEY`)
- API client: pakai `fetch` native (zero dependency) + `Config.SECRET_KEY` dari .env
- State management: React Context (cukup untuk 4 endpoint)
- Auth: Tidak pakai login, pakai `SECRET-KEY` header (value dari .env)
- SSE: `react-native-event-source` + `useBpkbStream` hook (secret_key via query param)

### Struktur Folder

```
src/
├── api/
│   ├── client.ts          (fetch wrapper + Config.SECRET_KEY dari .env)
│   ├── endpoints.ts       (getDealer, processBpkb, trackBpkb, getActivity)
│   └── index.ts
├── assets/
│   ├── audio/
│   │   └── sound.mp3      (feedback audio untuk pedal flow)
│   ├── fonts/
│   ├── images/
│   └── lottie/
├── components/
│   ├── CollapsibleTopAppBar.tsx  (M3 Expressive collapsing header + useCollapsibleHeader hook)
│   ├── CustomAlert.tsx           (modal alert: alert, confirm, success, error)
│   ├── LiquidGlassTabBar.tsx     (custom liquid glass bottom tab, pill active indicator)
│   ├── ScanFeedback.tsx          (✓ besar hijau, ✕ besar merah, hasil OCR/BC di tengah layar)
│   ├── ScanStepIndicator.tsx     (progress ①②③④ di atas layar scan)
│   └── TabIcons.tsx              (SVG icons: Home, Camera, Batch, Back, Search, Notification, More)
├── constants/
│   ├── colors.ts
│   ├── fonts.ts
│   ├── images.ts
│   └── index.ts
├── contexts/
│   ├── AlertContext.tsx   (global alert state + showError, showSuccess, showConfirm)
│   ├── ScanContext.tsx     (scan flow state: photos, nomesin, nobpkb, dealer)
│   └── TabNavContext.tsx   (share setActiveTab/activeTab antar komponen)
├── hooks/
│   ├── useBpkbStream.ts   (SSE realtime tracking)
│   ├── useSound.ts        (play/stop sound.mp3 untuk feedback audio)
│   └── useVolumeKey.ts    (listen Volume Up dari external keyboard/bluetooth shutter)
├── navigation/
│   ├── types.ts           (type-safe params)
│   ├── AppNavigator.tsx   (root: bottom tabs + TabNavProvider + AlertProvider)
│   ├── HomeStack.tsx      (Home tab)
│   ├── ScanStack.tsx      (Camera tab - pedal-driven scan flow)
│   ├── BatchStack.tsx     (Batch tab - tracking)
│   └── index.ts
├── screens/
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── scan/
│   │   ├── ScanStep1Screen.tsx   (foto halaman 1 — pedal → kamera → auto-next)
│   │   ├── ScanStep2Screen.tsx   (foto halaman 2 — pedal → kamera → auto-next)
│   │   ├── ScanStep3Screen.tsx   (foto halaman 3 — pedal → kamera → OCR → auto-next)
│   │   ├── ScanStep4Screen.tsx   (foto barcode — pedal → kamera → scan → auto-submit)
│   │   └── ReviewScreen.tsx      (edge case only — manual edit)
│   └── track/
│       └── TrackStatusScreen.tsx    (SSE realtime + stepper)
└── types/
    └── react-native-config.d.ts
```

### Navigasi Flow

```
Bottom Tab (Liquid Glass)
┌─────────────────────────────────────────┐
│  [Home]      [📷 Camera]      [Batch]  │
│   tab          center           tab     │
│                (raised)                 │
└─────────────────────────────────────────┘

Tab 1: Home Stack
  └── HomeMain (dashboard statistik)

Tab 2: Scan Stack (center button) — pedal-driven flow
  ├── ScanStep1 → foto halaman 1 → auto-next
  ├── ScanStep2 → foto halaman 2 → auto-next
  ├── ScanStep3 → foto halaman 3 → OCR → auto-next
  ├── ScanStep4 → foto barcode → scan → auto-submit
  └── Review → edge case only (edit manual)

Tab 3: Batch Stack
  └── TrackStatus (SSE realtime)
```

### Scan Flow (Pedal-Driven — sesuai diskusi 2026-07-08)

```
Step 1: pedal → kamera → foto halaman 1 → ✓ beep → auto-next
Step 2: pedal → kamera → foto halaman 2 → ✓ beep → auto-next
Step 3: pedal → kamera → foto halaman 3 → OCR → ✓ "nomesin" beep → auto-next
Step 4: pedal → kamera → foto barcode → scan → ✓ "nobpkb" beep → auto-submit
                                             ↓
                                       ✓✓✓ "Berhasil" beep beep beep → auto-reset
```

- 4x pedal press, 0x touch (happy path)
- Error: pause + input manual besar + pedal confirm
- ReviewScreen: edge case only (bukan flow utama)
- Auto-submit setelah step 4 kalau semua data OK
- Double-confirm: 1x press = ringkasan, 2x press = kirim

### Context: ScanContext

State antar screen scan flow:
- photo1, photo2, photo3, photo4 (ScanImage)
- nomesin, nobpkb (string)
- dealer (DealerData)

### Bottom Tab Bar

- Style: iOS 27 Liquid Glass (frosted glass effect)
- 3 tab: Home, Camera (center, raised), Batch
- Center button: lebih besar, naik ke atas, animasi pulse + sway
- Tab aktif: pill shape primary color + icon putih
- Tab camera aktif: tab bar hidden (slide-down animation) agar tidak menutupi content
- Package: `@react-navigation/bottom-tabs`, `react-native-reanimated`, `react-native-svg`

### CollapsibleTopAppBar (M3 Expressive)

- Lokasi: `src/components/CollapsibleTopAppBar.tsx`
- Export: `CollapsibleTopAppBar` (default), `useCollapsibleHeader()`, `EXPANDED_HEIGHT`, `COLLAPSED_HEIGHT`
- Expanded: title 28px Poppins-Bold left-aligned, subtitle visible
- Collapsed: title 18px Poppins-SemiBold centered, subtitle hidden
- Surface tint: transparent → rgba(248,250,252,1) saat scroll
- Back button: rounded-square 40px, borderRadius 12, bg rgba(0,35,102,0.08)
- Action buttons: circular 40px, 48dp touch target (hitSlop 8)
- Scroll driven: Reanimated useAnimatedScrollHandler + 5 useAnimatedStyle interpolations

### TabNavContext

- Lokasi: `src/contexts/TabNavContext.tsx`
- Fungsi: share `setActiveTab` dan `activeTab` antar komponen (AppNavigator → ScanStack → BatchStack)
- Digunakan: BackHandler back ke Home, header back button

### Back Button Behavior

- ScanIdentity (root scan stack): BackHandler Android + header back arrow → `setActiveTab(0)` (Home)
- ScanNoMesin/ScanBarcode/Review: native stack back navigation (standard)
- TrackStatus (root batch stack): BackHandler Android + header back arrow → `setActiveTab(0)` (Home)
- Home tab: BackHandler Android → default (tutup app)

## Larangan Tambahan

- DILARANG mulai coding tanpa baca .md dulu
- DILARANG buat file baru kalau file yang sama sudah ada dan bisa diedit
- DILARANG commit tanpa diminta user
- DILARANG jawab panjang lebar kalau bisa 1-3 baris

## Keputusan Desain UI (2026-07-08)

### HomeScreen — Redesign

**Data source:** `GET /api/activity` → `target_bpkb`, `completed_bpkb`, `pending_bpkb`

**Layout:**
```
┌──────────────────────────────────────┐
│  CollapsibleTopAppBar               │
│  MABPKB                     [🔔] [⋯]│
│  Scan Dokumen BPKB                   │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  42 / 150 BPKB                  ││  ← angka besar Poppins-Bold
│  │  ████████████░░░░░░░░░  28%     ││  ← progress bar animated fill
│  │  Target bulan ini tercapai      ││  ← subtitle kecil
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────┐ ┌──────────────┐   │
│  │   ✓  42      │ │   ○  108     │   │  ← 2 card: Selesai & Pending
│  │   Selesai    │ │   Pending    │   │
│  └──────────────┘ └──────────────┘   │
│                                      │
│  ┌──────────────────────────────────┐│
│  │        📷  Mulai Scan BPKB      ││  ← CTA full-width → tab camera
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Keputusan:**
- Progress bar sebagai hero element, animated fill dari 0% ke actual% saat mount
- 2 card (Selesai + Pending), bukan 3 — target sudah di progress bar
- Pending card: warna accent (biru) kalau > 0 → admin langsung tahu
- CTA "Mulai Scan": full-width, primary color, navigasi ke tab camera
- Pull-to-refresh di ScrollView
- CollapsibleTopAppBar: title collapse saat scroll
- **PRIORITAS TINGGI — UI/UX utama**

### TrackStatusScreen — Redesign

**Data source:** SSE `useBpkbStream` + `trackBpkb` (polling fallback)

**Layout:**
```
┌──────────────────────────────────────┐
│  ← Status Proses                 🔄  │  ← CollapsibleTopAppBar + refresh
│                                      │
│  Track ID: a1b2c3d4-e5f6...         │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  ●──  Queued             ✓      ││  ← hijau, checkmark
│  │  │    10:00:30                   ││
│  │  ●──  Create PDF         ← aktif││  ← biru, pulsing dot
│  │  │    sedang diproses...         ││
│  │  ○──  Update Stok Unit   menunggu││  ← abu-abu
│  │  │                               ││
│  │  ○──  Selesai            menunggu││  ← abu-abu
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │        📄  Buka PDF              ││  ← muncul saat completed
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │  ⚠  Error: Connection failed... ││  ← muncul saat failed
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Keputusan:**
- Stepper vertical 4 tahap: queued → create_pdf → update_stok_unit → completed
- Warna: hijau (selesai), biru aktif (pulsing), abu-abu (menunggu), merah (failed)
- Garis penghubung antar step — hijau kalau sudah lewat
- "Buka PDF" button: hanya muncul saat completed, buka URL di browser
- Error card merah: hanya muncul saat failed
- CollapsibleTopAppBar: title "Status Proses", action icon refresh
- Input Track ID tetap manual (admin simpan track_id dari response submit)
- **PRIORITAS TINGGI — UI/UX utama**

### API Endpoint Baru

- `GET /api/activity` → `target_bpkb`, `completed_bpkb`, `pending_bpkb`
- Perlu tambah `getActivity()` di `endpoints.ts`
- Response: `{ target_bpkb: number, completed_bpkb: number, pending_bpkb: number }`

### Camera Flow — Pedal-Driven Industrial (2026-07-08)

**Konteks:** Perusahaan menyediakan Bluetooth shutter kaki + tripod tinggi. Admin jarang memegang HP. Saat ini pakai external keyboard → tombol Volume Up sebagai trigger.

**Package baru:**
- `react-native-volume-manager` — listen hardware Volume Up key event
- `react-native-sound` — play audio feedback

**File struktur:**
```
src/
├── hooks/
│   ├── useVolumeKey.ts      (listen Volume Up, return callback)
│   ├── useSound.ts          (play/stop sound.mp3)
│   └── useBpkbStream.ts     (sudah ada)
├── components/
│   ├── ScanStepIndicator.tsx (progress ①②③④ di atas layar)
│   └── ScanFeedback.tsx     (✓ besar hijau, ✕ besar merah, hasil OCR/BC)
├── screens/scan/
│   ├── ScanStep1Screen.tsx   (foto halaman 1 — pedal → kamera → auto-next)
│   ├── ScanStep2Screen.tsx   (foto halaman 2 — pedal → kamera → auto-next)
│   ├── ScanStep3Screen.tsx   (foto halaman 3 — pedal → kamera → OCR → auto-next)
│   ├── ScanStep4Screen.tsx   (foto barcode — pedal → kamera → scan → auto-submit)
│   └── ReviewScreen.tsx      (edge case only — manual edit sebelum kirim)
```

**Flow utama (4x pedal, 0x touch):**
```
[1/4] "Tekan tombol untuk foto" → pedal → kamera → foto → ✓ beep → auto-next (1 detik)
[2/4] "Tekan tombol untuk foto" → pedal → kamera → foto → ✓ beep → auto-next
[3/4] "Tekan tombol untuk foto" → pedal → kamera → foto → OCR → "JFP1E2714484" beep → auto-next
[4/4] "Tekan tombol untuk foto" → pedal → kamera → foto → scan → "BPKB-2026-001" beep → auto-submit
                                                                              ↓
                                                                        ✓✓✓ beep beep beep
```

**Flow error (pause + manual):**
```
[3/4] pedal → foto → OCR gagal → 2x beep → "Ketik No Mesin" besar
      Admin ke HP → ketik → Enter → beep → auto-next
```

**Trigger:** Volume Up dari external keyboard/bluetooth shutter
**Sound:** `src/assets/audio/sound.mp3`
**Feedback:** ✓ hijau besar (success), ✕ merah besar (error), hasil OCR/BC besar di tengah

**Keputusan penting:**
- ReviewScreen TIDAK dipakai di flow utama — hanya edge case (edit manual)
- Auto-submit setelah foto 4 kalau semua data berhasil
- Double-confirm untuk submit: 1x press = tampilkan ringkasan, 2x press dalam 3 detik = kirim
- Auto-reset ke step 1 setelah submit berhasil (3 detik delay)
- Auto-reset ke step 1 setelah 2 menit idle (cegah stuck)

**Anti-error (skala industri):**
- Validasi foto tidak blur/gelap sebelum lanjut
- OCR result ditampilkan 2 detik sebelum auto-next (admin bisa lihat)
- Barcode result ditampilkan 2 detik sebelum auto-submit
- Sound pattern: 1 beep = success, 2 beep cepat = error, 3 beep naik = submit berhasil
