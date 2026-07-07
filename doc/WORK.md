> Setiap sesi wajib baca file ini sebelum mulai kerja.

## STATUS TERKINI (2026-07-06 15:48)

### Sudah Selesai
- ✅ Design system (warna, font, images)
- ✅ API client (fetch + SECRET-KEY header)
- ✅ Endpoint getDealer, processBpkb, trackBpkb
- ✅ SSE hook (useBpkbStream)
- ✅ Navigasi (bottom tab liquid glass + stack per tab)
- ✅ ScanContext (state antar screen scan flow)
- ✅ ScanIdentityScreen (foto 1 & 2)
- ✅ ScanNoMesinScreen (foto 3 + OCR + getDealer)
- ✅ ScanBarcodeScreen (foto 4 + barcode)
- ✅ ReviewScreen (review + submit /process)
- ✅ TrackStatusScreen (SSE realtime)
- ✅ HomeScreen (dashboard statistik)
- ✅ Lint ✅ TypeScript ✅

### Belum Dikerjakan
- ⏳ Testing di device fisik
- ⏳ HomeScreen: statistik real (query dari API/SQLite lokal)
- ⏳ Error handling lebih robust (retry, offline state)
- ⏳ UI polish (loading shimmer, empty state, dll)
- ⏳ Hapus file lama yang tidak dipakai (jika ada)

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

| Step | Endpoint | Auth | Fungsi |
|------|----------|------|--------|
| 1 | `GET /api/get-dealer?nomesin=...` | SECRET-KEY header | Ambil nama dealer |
| 2 | `POST /api/bpkb/process` | SECRET-KEY header | Upload 4 foto + nomesin + nobpkb (multipart) |
| 3 | `GET /api/bpkb/track/{id}` | SECRET-KEY header | Cek status proses (polling) |
| 4 | `GET /api/bpkb/track/{id}/stream` | SECRET-KEY query param | SSE realtime tracking |

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

- `.env` → `API_BASE_URL=https://aciax.menara-agung.com`
- `.env` sudah ditambahkan ke `.gitignore`
- `android/app/build.gradle` → sudah tambah `dotenv.gradle`
- Type declaration: `src/types/react-native-config.d.ts`
- API client: pakai `fetch` native (zero dependency) + `SECRET-KEY` header
- State management: React Context (cukup untuk 4 endpoint)
- Auth: Tidak pakai login, pakai `SECRET-KEY` header (fixed)
- SSE: `react-native-event-source` + `useBpkbStream` hook

### Struktur Folder

```
src/
├── api/
│   ├── client.ts          (fetch wrapper + SECRET-KEY header)
│   ├── endpoints.ts       (getDealer, processBpkb, trackBpkb)
│   └── index.ts
├── assets/
│   ├── fonts/
│   ├── images/
│   └── lottie/
├── components/
│   ├── LiquidGlassTabBar.tsx  (custom iOS 27 liquid glass bottom tab)
│   └── TabIcons.tsx           (SVG icons: Home, Camera, Batch)
├── constants/
│   ├── colors.ts
│   ├── fonts.ts
│   ├── images.ts
│   └── index.ts
├── contexts/
│   └── ScanContext.tsx     (scan flow state: photos, nomesin, nobpkb, dealer)
├── hooks/
│   └── useBpkbStream.ts   (SSE realtime tracking)
├── navigation/
│   ├── types.ts           (type-safe params)
│   ├── AppNavigator.tsx   (root: bottom tabs)
│   ├── HomeStack.tsx      (Home tab)
│   ├── ScanStack.tsx      (Camera tab - scan flow)
│   ├── BatchStack.tsx     (Batch tab - tracking)
│   └── index.ts
├── screens/
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── scan/
│   │   ├── ScanIdentityScreen.tsx   (foto 1 & 2)
│   │   ├── ScanNoMesinScreen.tsx    (foto 3 + OCR + getDealer)
│   │   ├── ScanBarcodeScreen.tsx    (foto 4 + barcode)
│   │   └── ReviewScreen.tsx         (review + submit)
│   └── track/
│       └── TrackStatusScreen.tsx    (SSE realtime)
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

Tab 2: Scan Stack (center button)
  ├── ScanIdentity → foto 1 & 2 (simpan)
  ├── ScanNoMesin → foto 3 → OCR → hit getDealer
  ├── ScanBarcode → foto 4 → scan barcode No BPKB
  └── Review → review semua data → hit /process

Tab 3: Batch Stack
  └── TrackStatus (SSE realtime)
```

### Scan Flow (sesuai flow.md)

```
1. ScanIdentity: Foto halaman 1 & 2 BPKB → simpan di context
2. ScanNoMesin: Foto halaman 3 → OCR (ML Kit) → regex ambil No Mesin → hit getDealer API
3. ScanBarcode: Foto halaman 4 → scan barcode (ML Kit) → ambil No BPKB
4. Review: Review semua data + foto → submit ke /api/bpkb/process
5. TrackStatus: SSE realtime tracking → status completed/failed
```

### Context: ScanContext

State antar screen scan flow:
- photo1, photo2, photo3, photo4 (ScanImage)
- nomesin, nobpkb (string)
- dealer (DealerData)

### Bottom Tab Bar

- Style: iOS 27 Liquid Glass (frosted glass effect)
- 3 tab: Home, Camera (center, raised), Batch
- Center button: lebih besar, naik ke atas, animasi pulse + sway
- Package: `@react-navigation/bottom-tabs`, `react-native-reanimated`, `react-native-svg`

## Larangan Tambahan

- DILARANG mulai coding tanpa baca .md dulu
- DILARANG buat file baru kalau file yang sama sudah ada dan bisa diedit
- DILARANG commit tanpa diminta user
- DILARANG jawab panjang lebar kalau bisa 1-3 baris
