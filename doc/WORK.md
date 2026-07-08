> Setiap sesi wajib baca file ini sebelum mulai kerja.

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
