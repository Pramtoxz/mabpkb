# ACIAX MABPKB — UI/UX & Architecture Blueprint (2026)

Dokumen ini adalah ringkasan kesepakatan arsitektur desain antarmuka, library terpilih, dan aturan bisnis untuk perombakan UI/UX aplikasi pemindai BPKB ACIAX.

---

## 1. Brand Identity & Design Tokens

* **Identitas Brand:** ACIAX — *"Smart Scanning Experience"* / *"Scan Smarter. Work Faster."*
* **Palet Warna Resmi:**
  * **ACIAX Violet (`#8052F5`):** Identitas brand utama, tombol aksi primer (CTA), fokus, dan highlight.
  * **Scanner Mint (`#43D6AD`):** Aksen maskot robot, reticle kamera pemindai.
  * **Emerald Green (`#00BA68`):** Header status sukses, konfirmasi, identitas korporat.
  * **Graphite (`#20232D`):** Teks utama, judul, struktur antarmuka (kontras tinggi, anti-glare).
  * **Cloud White (`#F6F7FA`):** Latar belakang antarmuka yang bersih dan bernapas.
* **Maskot 3D:** Karakter robot mint ramah dengan mata mengedip `(•‿<)`, reticle bracket scanner, memegang tablet scanner futuristik dengan lambang heksagonal ACIAX menyala ungu.

---

## 2. Library Terpilih (Narrowed Down & Agreed)

| No | Library | Fungsi & Peran UI/UX | Status |
| :---: | :--- | :--- | :---: |
| 1 | **`react-native-zoom-toolkit`** | **Document Deep-Zoom (120 FPS):** Pinch-to-zoom & pan interaktif pada modal preview dokumen BPKB untuk memeriksa nomor rangka & mesin. | Deal ⭐⭐⭐⭐⭐ |
| 2 | **`@gorhom/bottom-sheet` (v5)** | **Interactive Sheet Modal:** Menggantikan dialog kaku menjadi lembar geser dengan snap points (25% preview, 60% rincian data OCR, 90% edit form). | Deal ⭐⭐⭐⭐⭐ |
| 3 | **`react-native-copilot` / `tour-guide`** | **Interactive Spotlight Tour:** Panduan langkah demi langkah fitur scanner & pedal kaki bagi operator baru. | Deal ⭐⭐⭐⭐⭐ |
| 4 | **`@shopify/flash-list`** | **High-Speed Recycling List:** Menampilkan ratusan riwayat BPKB tanpa blank cell dengan performa 60 FPS. | Deal ⭐⭐⭐⭐⭐ |
| 5 | **`sonner-native`** | **Floating Capsule Toasts:** Notifikasi mengambang (ala Dynamic Island) dengan swipe-to-dismiss & morphing state. | Deal ⭐⭐⭐⭐⭐ |
| 6 | **`lucide-react-native`** | **Unified Design System Icons:** 1,700+ ikon SVG minimalis bergaris seragam. | Deal ⭐⭐⭐⭐ |
| 7 | **`moti/skeleton`** | **Shimmer Loading:** Animasi kilau saat sistem memproses OCR atau mengambil data API. | Deal ⭐⭐⭐⭐ |
| 8 | **`react-native-confetti-cannon`** | **Micro-Delight Celebration:** Letupan partikel konfeti halus saat 5 step BPKB berhasil tervalidasi 100%. | Deal ⭐⭐⭐ |

---

## 3. Aturan Bisnis & SOP Desain (Strict Rules)

1. **TIDAK ADA OPSI HAPUS DATA:**
   * Dokumen BPKB adalah arsip fidusia legal berharga.
   * Dua aksi eksklusif QC: **"Foto Ulang"** *(Retake Scan)* dan **"Preview"** *(Inspect Detail)*.
   * Tombol "Foto Ulang" **DILARANG** menggunakan warna merah bahaya (`Colors.error`). Wajib bernada konstruktif menggunakan warna primer (ACIAX Violet `#8052F5` atau Emerald).

2. **HARAM Mengubah Logika Inti Scanner:**
   * Dilarang mengotak-atik: `ScanStep1Screen.tsx` s/d `ScanStep5Screen.tsx` (logika capture), `PedalCamera.tsx`, `documentScanner.ts`, `roiCalculator.ts`, `ScanContext.tsx`, dan hook pedal di `MainActivity.kt`.
   * Hanya diperbolehkan merombak tampilan UI pembungkus (overlay, preview modal, thumbnail strip, alert).

3. **Integritas Gaya & Zero Hardcode:**
   * Dilarang keras menggunakan emoji di teks.
   * Semua warna, font, spacing, dan gambar wajib terdaftar di `src/constants/` (`colors.ts`, `fonts.ts`, `images.ts`, `typography.ts`).
   * Clean code: Tanpa komentar sampah `//` atau `{/* */}` pada komponen produksi.
