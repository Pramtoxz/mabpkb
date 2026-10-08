# UI/UX Overhaul — Catatan Sesi untuk Sesi Berikutnya

> **Tanggal sesi:** 3 Agustus 2026
> **Status:** BELUM DIKERJAKAN — rencana sudah final, menunggu eksekusi.
> **Baca ini SETELAH baca `CLAUDE.md` dan `diskus.md`.** Dokumen ini melanjutkan dari situ — tidak mengulang konteks project, hanya membahas UI/UX.

---

## Konteks Singkat

Operator tunggal, PT Menara Agung Honda. HP di tripod, tombol volume sebagai shutter. Ribuan BPKB/hari. 8+ jam kerja. Sering tidak menatap layar langsung. App saat ini fungsional tapi UI-nya kaku, monoton, dan terasa generik/"terlalu AI".

Sesi ini mengaudit seluruh UI dari perspektif psikologi pengguna dan merencanakan overhaul visual tanpa menyentuh logic/fitur yang sudah jalan.

---

## Masalah yang Ditemukan

### 1. Warna melelahkan untuk kerja 8 jam

- `primary: #002366` (navy mati) di atas `background: #F8FAFC` (quasi-putih dingin) = kontras tajam yang melelahkan retina untuk sesi panjang
- Seluruh palet biru-abu-putih — tidak ada warmth, tidak ada variasi emosional
- Warna status (`#16a34a` hijau, `#DC2626` merah) hardcoded tersebar di 7+ file, bukan dari token
- Tidak ada warna `warning` untuk state processing — semuanya biru atau hijau

### 2. Safe area dilanggar di layar scan

- **Scan screens (step 1-5):** punya `paddingBottom: insets.bottom` tapi TIDAK punya `paddingTop: insets.top` — konten bisa tertutup notch/punch-hole
- **ScanStepIndicator:** hanya `paddingVertical: 16` tanpa memperhitungkan inset atas
- **Tab bar scroll clearance:** hardcoded `paddingBottom: 120` di HomeScreen/TrackScreen, bukan dihitung dari tinggi tab bar + insets
- **Camera area:** tidak ada offset dari atas, bisa overlap status bar di device tertentu

### 3. Font tidak cocok konteks

- Poppins + OpenSans = kombinasi generik yang muncul di 90% project AI
- Nomor mesin/BPKB (`JMF2E1774885`) ditampilkan di font yang `0/O`, `1/l/I` ambigu — operator harus verifikasi akurasi, ini masalah data integrity bukan estetika
- Hint text 13-14px dengan `opacity: 0.6` = nyaris tidak terbaca dari jarak tripod (~50-70cm)
- `opacity` pada teks di Android = sub-pixel rendering buram, lebih buruk dari warna solid

### 4. Hierarchy informasi tidak melayani operator

- Step indicator (36-40px dots) terlalu kecil untuk flow yang 100% tentang progres linear 5 langkah
- Step indicator tidak menampilkan NAMA step, hanya angka — beban kognitif tidak perlu
- Feedback sukses/gagal pakai icon SVG statis — tidak menarik perhatian peripheral (operator sering lihat dokumen, bukan layar)
- Hint card di bawah layar scan memakan ~80px untuk informasi yang sudah dihafalkan setelah 10 menit pakai

### 5. Tidak ada reward loop

- 1.200+ interaksi/hari tanpa micro-reward yang memuaskan
- Lottie `success.json` (ceklis animasi gaya GoPay) dan `business.json` (roket terbang) sudah ada di `src/assets/lottie/` tapi TIDAK DIPAKAI SAMA SEKALI — `lottie-react-native@7.3.8` juga sudah terinstall
- Haptic vibration hanya disebut di diskus.md tapi tidak diimplementasi di capture step 1, 2, 4
- Sound (`useSound`) hanya dipanggil di step 3 dan 5, step 1/2/4 diam total
- Transisi antar step = instant cut (tanpa animasi) — jarring

---

## Rencana Overhaul

### Fase 1 — Langsung dikerjakan (tidak butuh aset tambahan)

Urutan eksekusi:

| #   | Item                           | File yang diubah                                                                                                                  | Catatan                                                                                                                                                                                                                              |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Token warna baru**           | `src/constants/colors.ts`                                                                                                         | Background warm `#FAF8F5`, primary lebih hidup `#1E3A5F`, token semantic: `success: #059669`, `successLight: #D1FAE5`, `errorLight: #FEE2E2`, `warning: #D97706`, `warningLight: #FEF3C7`, `textSecondary: #64748B`, `card: #FFFFFF` |
| 2   | **Hapus hardcoded colors**     | `ScanStep3Screen`, `ScanStep5Screen`, `PhotoCaptureStep`, `ScanStepIndicator`, `ScanFeedback`, `TrackStatusScreen`, `CustomAlert` | Semua `#16a34a`, `#dcfce7`, `#fef2f2`, `#15803d`, `#eff6ff` → token dari `Colors`                                                                                                                                                    |
| 3   | **Safe area fixes**            | Semua scan screens, `ScanStepIndicator`                                                                                           | Tambah `paddingTop: insets.top`, hitung tab bar clearance dinamis                                                                                                                                                                    |
| 4   | **Opacity teks → warna solid** | Semua file yang pakai `opacity: 0.5/0.6` pada `Text`                                                                              | Ganti ke `Colors.textSecondary` solid                                                                                                                                                                                                |
| 5   | **Lottie success.json**        | `PhotoCaptureStep`, `ScanStep3Screen`, `ScanStep5Screen`, `CustomAlert`                                                           | Gantikan `CheckIcon` statis dengan Lottie animasi. Buat wrapper reusable `LottieSuccess`                                                                                                                                             |
| 6   | **Lottie business.json**       | `ScanStep5Screen`                                                                                                                 | Gantikan `ActivityIndicator` di phase `submitting`                                                                                                                                                                                   |
| 7   | **Haptic + sound**             | `PedalCamera` atau `PhotoCaptureStep`                                                                                             | `Vibration.vibrate(50)` saat capture, `play('success')` di step 1/2/4                                                                                                                                                                |
| 8   | **Navigator transition**       | `ScanStack.tsx`                                                                                                                   | `animation: 'slide_from_right'` di screen options                                                                                                                                                                                    |
| 9   | **Font readability**           | Semua file                                                                                                                        | Naikkan minimum teks instruksi 13→16px, perjelas hierarki size                                                                                                                                                                       |
| 10  | **Step indicator + label**     | `ScanStepIndicator`                                                                                                               | Tampilkan nama step aktif, bukan hanya angka. Glow/shadow pada dot aktif                                                                                                                                                             |

### Fase 2 — Butuh aset/keputusan dari user

| #   | Item                                                                  | Butuh dari user                                                                                     | Status user response                           |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 11  | **Font Roboto Mono** untuk data display (nomor mesin, BPKB, track ID) | File `.ttf` Regular + Medium di `src/assets/fonts/Roboto_Mono/`                                     | **BELUM DIJAWAB**                              |
| 12  | **Kalender heatmap** di HomeScreen — jumlah BPKB per hari             | Endpoint API: `GET /api/activity/daily?month=YYYY-MM` → `{ days: [{ date, count }], target_daily }` | **BELUM DIJAWAB** — bisa dimock dulu           |
| 13  | **Widget cuaca** di HomeScreen                                        | Pilih: (A) API key OpenWeatherMap, (B) koordinat kantor saja (pakai Open-Meteo gratis), (C) skip    | **BELUM DIJAWAB**                              |
| 14  | **Lottie tambahan** — scanning loop, empty state, weather set         | File `.json` dari LottieFiles.com di `src/assets/lottie/`                                           | **OPSIONAL** — bisa pakai Reanimated animation |

### Keputusan desain yang belum diambil

| Pertanyaan                    | Opsi                                                                                                                  | Status            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Layout HomeScreen baru        | Greeting + jam + cuaca + progress + kalender heatmap + CTA. Wireframe ada di artifact sesi ini                        | **BELUM DIJAWAB** |
| Greeting pakai nama operator? | (A) "Selamat pagi, Pak Andi" (butuh config di `.env`), (B) "Selamat pagi" generik                                     | **BELUM DIJAWAB** |
| Brand identity app            | Header sekarang "MABPKB". Pilih: tampilkan "MABPKB", "ACIAX", atau lainnya? Logo Menara Agung/Honda muncul di header? | **BELUM DIJAWAB** |

---

## File yang TIDAK BOLEH Disentuh oleh Overhaul Ini

| File                                        | Alasan                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/components/PedalCamera.tsx`            | Logic capture kamera — sudah dites di device, jangan ubah kecuali tambah 1 baris Vibration |
| `src/components/DocumentOverlay.tsx`        | Overlay kamera — diskus.md bilang jangan ubah sebelum tes device tuntas                    |
| `src/utils/documentScanner.ts`              | Pipeline OpenCV — murni backend processing                                                 |
| `src/contexts/ScanContext.tsx`              | State management — tidak ada urusan visual                                                 |
| `src/api/client.ts`, `src/api/endpoints.ts` | API calls — tidak relevan (kecuali tambah endpoint baru untuk kalender/cuaca)              |
| `src/hooks/useHardwareKey.ts`               | Hardware listener                                                                          |
| `src/utils/noMesin.ts`                      | Utility OCR                                                                                |
| `src/hooks/useBpkbStream.ts`                | SSE stream — sudah benar, jangan sentuh                                                    |

## Kontrak yang Harus Dipertahankan

Dari diskus.md — ini keputusan final user, bukan boleh "diperbaiki":

- Props publik `PedalCamera` (`filename`, `onCapture`, `overlayVariant`) TIDAK berubah
- Props publik `ScanStepIndicator` (`currentStep`, `totalSteps`) boleh di-extend tapi existing harus tetap jalan
- Props publik `ScanFeedback` (`type`, `message`, `visible`) sama — boleh extend, jangan break
- `ScanStackParamList` 5 route (`ScanStep1..5`) — jangan tambah/hapus route
- `ScanContext` field names (`photo1..4`, `nomesin`, `nobpkb`, `dealer`) — jangan rename
- SSE di `TrackStatusScreen` pakai query param `?secret_key=` BUKAN header — ini disengaja, jangan "perbaiki"

---

## Catatan Teknis

- `lottie-react-native@^7.3.8` sudah terinstall — tinggal import dan pakai
- `react-native-reanimated` sudah ada — dipakai untuk semua micro-animation
- `react-native-linear-gradient` sudah ada — dipakai di `CustomAlert.tsx`, bisa dipakai untuk gradient progress bar
- `react-native-safe-area-context` sudah ada — `useSafeAreaInsets()` sudah dipanggil di semua screen, hanya belum semua memanfaatkan `insets.top`
- Font linking di RN 0.86: taruh `.ttf` di `src/assets/fonts/`, RN auto-link lewat `react-native.config.js` (sudah ada config `assets: ['./src/assets/fonts/']` — cek ulang)
- Jangan install package baru kecuali benar-benar tidak bisa dihindari — setiap dependency baru = risiko native build break

---

## Referensi Psikologi Warna yang Dipakai

Keputusan palet warna baru bukan asal pilih, tapi berdasarkan:

- **Background warm off-white (`#FAF8F5`):** mengurangi blue-light fatigue dibanding cool-white. Untuk sesi kerja panjang, sedikit warmth di background secara terukur mengurangi kelelahan retina (same reason kenapa Night Shift/Night Mode ada)
- **Primary biru lebih hidup (`#1E3A5F`):** masih biru = trust/reliability (penting untuk tool internal perusahaan), tapi lebih saturasi = tidak terasa "mati" setelah dilihat berulang-ulang
- **Success emerald (`#059669`):** lebih warm dari green-600 default (`#16a34a`), lebih mudah ditangkap peripheral vision
- **Warning amber (`#D97706`):** state "sedang proses" butuh warna sendiri — bukan biru (terlalu mirip primary), bukan hijau (terlalu mirip sukses), bukan merah (terlalu mirip error). Amber = "perhatikan, sedang berjalan"
- **Text secondary solid (`#64748B`):** menggantikan `opacity: 0.5/0.6` pada teks. Warna solid rendering-nya lebih tajam di Android daripada transparency overlay

---

## Skill yang Dipakai Sesi Ini

UI/UX Pro Max skill (`C:\Users\pramu\.agents\skills\ui-ux-pro-max`) — database desain lokal. Dipakai untuk:

- Generate design system: `--design-system --variance 3 --motion 4 --density 7`
- Search color psychology: `--domain color "color psychology trust calm focus productivity warm neutral"`
- Search typography: `--domain typography "readability monospace data display tool"`
- Search UX guidelines: `--domain ux`, `--domain web`, `--stack react-native`
- Reference: `references/pro-rules.md` (pre-delivery checklist untuk mobile app)
