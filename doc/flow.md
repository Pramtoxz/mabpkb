1. Android Foreground (Kamera & UI)
   Admin mulai scan → isi identitas (Hal 1&2) → No Mesin (Hal 3, dengan ML Kit OCR + regex) → pilih dealer (Hal 4) → scan QR Code (Hal 5) → scan barcode No BPKB (ML Kit Barcode) → data di-bundle (4 foto + 2 nomor) → disimpan ke SQLite lokal dengan status "Pending" → HP getar & beep, UI reset untuk scan berikutnya.
2. Android Background (Antrean Sinkronisasi)
   Background worker aktif cari data pending di SQLite → kirim POST multipart form ke /api/bpkb/process → cek respons HTTP 200:

Kalau OK → hapus baris dari SQLite lokal (sukses)
Kalau gagal → retry setelah 5 menit (loop)

3. Web Laravel (Pemrosesan PDF & Database)

Endpoint API terima request → query DB untuk ambil nama konsumen (meta) → kompres foto 70% + insert watermark (pakai library "Intervention Image") → gabung jadi 1 file PDF → simpan PDF di VPS dengan status "Ready"
Update BAST di DB NMS & Meta → kirim notifikasi ke Dashboard PC Admin → return 200 OK ke HP Android
Ada fail-safe: kalau proses gagal → return HTTP 500 + alarm "TET-TET" di dashboard, dan file PDF gagal dihapus dari server
Ada juga API look-ahead (/api/get-dealer) yang dipanggil lebih dulu (garis putus-putus hijau) untuk ambil nama dealer sebelum proses utama — dipakai di UI Hal 4 juga

4. PC Free Area (Script Downloader)
   Script Node.js jalan di PC kantor → polling GET /get-ready-pdfs (pakai Bearer Token) tiap interval:

Kalau ada PDF → download ke memory lokal → pindah ke network drive (Z:) → konfirmasi sukses via POST /pdf-downloaded → langsung loop cari lagi (tanpa sleep, biar cepat)
Kalau tidak ada → sleep 1 menit, lalu polling lagi
Ada catatan "Smart Polling": custom User-Agent, kalau VPS bilang "ADA" maka jangan sleep, langsung tembak API lagi

Alur besarnya: Admin scan dokumen fisik di HP → data + foto naik ke server Laravel secara background/async → server proses jadi PDF resmi (dengan watermark & kompresi) → PC kantor otomatis polling & download PDF itu ke network drive, tanpa perlu ada yang manual pindahin file.
