# ACIAX MABPKB — MASTER ARCHITECTURE & UI/UX BLUEPRINT

Dokumen ini adalah **sumber kebenaran tunggal (Single Source of Truth)** untuk arsitektur teknis, aturan kerja keras, integrasi hardware, dan desain antarmuka aplikasi **MABPKB** (PT Menara Agung). 
AI Agent pada sesi selanjutnya **WAJIB** membaca dan menaati dokumen ini secara ketat tanpa asumsi atau halusinasi.

---

## 1. Konteks Entitas & Tujuan Aplikasi

* **Klien / Entitas:** PT Menara Agung (Main Dealer Motor & Suku Cadang Resmi Honda Wilayah Sumatera Barat).
* **Nama Proyek:** ACIAX MABPKB (Sistem Digitalisasi Berkas BPKB Terintegrasi Hardware Pedal Kaki Bluetooth).
* **Tujuan Utama:** Menghilangkan pemindaian manual yang lambat dengan sistem *100% hands-free scanning loop*. Operator membalik halaman fisik BPKB di meja workstation dan menekan pedal kaki Bluetooth untuk mengambil foto, memvalidasi OCR nomor mesin/rangka, memilih dealer, memindai barcode, dan mengirimkan berkas ke sistem background.
* **Lingkungan Mocking:** Menggunakan `.env` dengan `APP_ENV=local`. Semua data pengembangan bersumber dari file mock di `src/mock/` agar tim backend tinggal menyesuaikan skema API nantinya.

---

## 2. Aturan Kerja Keras (Haram Dilanggar)

1. **STRICTLY ZERO COMMENTS:**
   * Dilarang keras menyisakan komentar apapun (`//`, `/* */`, `{/* */}`) di seluruh file kode sumber (`.ts`, `.tsx`, `.kt`, `.java`).
2. **STRICTLY ZERO EMOJIS:**
   * Dilarang menggunakan emoji dekoratif di teks UI, judul, tombol, alert, maupun file mock data.
3. **PENGUNCIAN WARNA (`src/constants/colors.ts`):**
   * File `colors.ts` dikunci total. Dilarang menambah atau memodifikasi token warna.
   * Seluruh komponen wajib menggunakan token warna resmi:
     * `Colors.primary` / `Colors.aciaxViolet` (`#8052F5`): Aksi utama, brand core, tombol CTA.
     * `Colors.emeraldMint` / `Colors.aciaxMint` (`#43D6AD`): Aksen scanner, reticle kamera.
     * `Colors.textHeadline` / `Colors.aciaxGraphite` (`#20232D`): Teks utama kontras tinggi.
     * `Colors.background` / `Colors.aciaxCloudWhite` (`#F6F7FA`): Latar belakang bersih.
     * `Colors.surface` (`#FFFFFF`): Permukaan kartu dan sheet.
     * `Colors.secondary` (`#F3E8FF`): Latar badge tint violet.
   * Dilarang keras melakukan *hardcode* nilai hex warna di dalam file komponen.
4. **HARAM MENGUBAH LOGIKA INTI SCANNER:**
   * Dilarang mengotak-atik alur tangkapan kamera: `ScanStep1Screen.tsx` s/d `ScanStep5Screen.tsx`, `PedalCamera.tsx`, `documentScanner.ts`, `roiCalculator.ts`, `ScanContext.tsx`, dan hook pedal hardware di `MainActivity.kt`.
   * Hanya diperbolehkan merombak tampilan UI pembungkus (overlay, preview modal, thumbnail strip, alert, navigation).
5. **TIDAK ADA OPSI HAPUS DATA:**
   * Berkas BPKB adalah arsip fidusia legal berharga. Dua aksi eksklusif kendali mutu QC adalah **"Foto Ulang"** *(Retake)* dan **"Preview"** *(Inspect Detail)*.
   * Tombol "Foto Ulang" DILARANG memakai warna merah bahaya (`Colors.error`), wajib bernada konstruktif menggunakan warna primer.
6. **ARSITEKTUR MOCK DATA:**
   * Data pengembangan wajib diletakkan di file terpisah pada direktori `src/mock/`:
     * `dealers.json`: Data master dealer (kode dealer, nama dealer).
     * `performance.json`: Data target dan grafik harian/bulanan.
     * `team.json`: Data profil 4 anggota tim IT Menara Agung.
     * `handover.json`, `history.json`, `revisions.json`: Data riwayat berkas.
7. **MODULARITAS KOMPONEN:**
   * Dilarang menumpuk kode monolithic dalam 1 file. Setiap komponen modular harus dipecah ke sub-direktori `components/`.
8. **STANDAR VERIFIKASI SEBELUM SELESAI:**
   * Setiap perubahan wajib lulus pemeriksaan TypeScript: `npx tsc --noEmit` dengan 0 error.

---

## 3. Integrasi Hardware Pedal Kaki Bluetooth

* **Mekanisme Hardware:** Pedal kaki Bluetooth beroperasi sebagai perangkat HID nirkabel yang memancarkan sinyal keyboard `KEYCODE_VOLUME_DOWN` (`volumeDown`).
* **Intersepsi Native (Android):**
  * `MainActivity.kt` dan `PedalModule.kt` menangkap sinyal tombol fisik volume bawah secara native.
  * Sinyal dicegat (*intercepted*) agar **popup slider volume bawaan OS Android TIDAK muncul** di layar.
* **Deteksi Konektivitas Real-Time:**
  * Hook `usePedalStatus` memantau sambungan Bluetooth secara dinamis.
* **Alert HUD Luar Scan (`BluetoothPedalModal`):**
  * Jika pedal diinjak di luar layar kamera pemindai, atau saat pedal bertransisi dari *terputus* menjadi *terhubung*, muncul modal animasi Lottie layar penuh (`src/assets/lottie/bluetooth.json`).
  * Modal ini bersih tanpa tombol penutup dan tanpa teks deskripsi panjang (*pure instant HUD alert*).

---

## 4. Alur Bisnis Operasional (End-to-End Workflow)

1. **Foreground Scanning (Step 1 s/d Step 5):**
   * Step 1 & 2: Pemindaian Halaman Identitas & Berkas Utama (continuous capture + thumbnail strip).
   * Step 3: Nomor Rangka & Nomor Mesin (terekstraksi otomatis via `@react-native-ml-kit/text-recognition` + validasi regex).
   * Step 4: Pemilihan Dealer (pencarian berbasis **Kode Dealer** atau **Nama Dealer**, bukan wilayah/daerah, sesuai SOP cabang).
   * Step 5: Pemindaian Barcode BPKB + QR Code -> data di-bundle lokal status "Pending".
2. **Hands-Free Looping:**
   * Submit -> Otomatis diarahkan ke menu Riwayat (proses background worker & kompresi PDF) -> saat berkas siap dan pedal kaki diinjak -> sistem otomatis kembali membuka kamera scan step 1 tanpa sentuhan tangan.

---

## 5. Inventaris Layar & Pedoman Antarmuka (UI/UX)

* **Navigasi Layar Penuh (*Tab Bar Control*):**
  * Pada layar fitur penuh seperti `TeamScreen`, `PerformanceScreen`, `DealerScreen`, tab bar bawah disembunyikan menggunakan `useTabNav().setIsTabBarHidden(true)`.
* **HomeScreen:**
  * Header identitas ACIAX + status real-time koneksi pedal Bluetooth.
  * Kartu utama scanner (maskot 3D robot mint).
  * *Semi-Circular Gauge* (inspeksi produktivitas harian dengan jadwal kerja **Senin s/d Sabtu**).
  * *Quick Action Ribbon* memuat: *Informasi Dealer*, *Riwayat BPKB*, *Performance*, *Panduan SOP*, *Tes Pedal*, dan *Tentang Kami (Tim IT)*.
* **TeamScreen (Profil Tim IT Menara Agung):**
  * **1 Layar Penuh Tanpa Scroll:** Menggunakan `flex: 1` dengan margin vertikal alami yang padu (tanpa `justifyContent: 'space-between'` yang menyebabkan rongga kosong).
  * **Logo Utama:** Logo Menara Agung (`src/assets/images/malogo.png`) berada di tengah atas dalam wadah bersudut lengkung (`borderRadius: 20`), judul *Tim Development*, deskripsi sistem, dan *PT Menara Agung* (tanpa visi/misi formal).
  * **Wajah & Rambut Utuh 100%:** Foto asli (`rezi.png`, `surya.png`, `dito.png`, `rafi.png`) memiliki rasio 3:4 portrait dengan rambut di piksel teratas (`y = 0`). Avatar sirkular menggunakan `resizeMode="contain"` dengan ceiling clearance agar kepala tidak pernah terpotong.
  * **4 Slim Cards:** Menampilkan 4 anggota tim (Fahrezi, Surya, Dito, Rafi) dengan badge peran dan ringkasan tanggung jawab 1 baris.
  * **Modal Detail Interaktif:** Saat kartu disentuh, modal muncul menampilkan foto profil besar, 3 butir tanggung jawab teknis profesional, dan tombol direct link profil Instagram.

---

## 6. Library Terpilih (Sesuai `doc/UI-UX-BLUEPRINT.md`)

* `react-native-zoom-toolkit`: Deep-zoom 120 FPS untuk inspeksi nomor rangka/mesin di modal preview.
* `@gorhom/bottom-sheet` (v5): Lembar geser interaktif snap-points menggantikan dialog statis.
* `react-native-copilot` / `tour-guide`: Spotlight onboarding operator baru.
* `@shopify/flash-list`: Rendering daftar riwayat berkecepatan 60 FPS.
* `sonner-native`: Floating capsule toasts ala Dynamic Island.
* `lucide-react-native` & `react-native-svg`: Ikon vektor seragam.
* `moti/skeleton`: Animasi shimmer loading saat OCR / fetch API.
* `react-native-confetti-cannon`: Konfeti mikro saat verifikasi 5 step sukses 100%.

---

## 7. Referensi Dokumen Terkait

* [doc/UI-UX-BLUEPRINT.md](file:///d:/Mobile/mabpkb/doc/UI-UX-BLUEPRINT.md): Cetak biru desain UI/UX dan library terpilih.
* [doc/BACKEND-API-SPECS.md](file:///d:/Mobile/mabpkb/doc/BACKEND-API-SPECS.md): Spesifikasi kontrak endpoint backend untuk proses antrean dan sinkronisasi.
* [doc/API.md](file:///d:/Mobile/mabpkb/doc/API.md): Dokumentasi teknis endpoint API yang sudah berjalan.
