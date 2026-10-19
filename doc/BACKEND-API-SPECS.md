# Spesifikasi Endpoint API & Logika Bisnis Backend (ACIAX MABPKB)

Dokumen ini mendefinisikan kontrak data (*API Contracts & Schema*) serta panduan logika bisnis database (*Business Logic*) yang digunakan pada antarmuka aplikasi mobile ACIAX MABPKB.

Saat ini aplikasi mobile telah mengimplementasikan penampung data lokal (`.env=local` pada direktori `src/mock/`). Ketika tim backend telah siap, endpoint berikut dapat disediakan untuk diintegrasikan secara penuh.

---

### 1. Informasi Cabang Dealer
- **Endpoint**: `GET /api/dealers`
- **Tujuan**: Menampilkan direktori seluruh cabang PT Menara Agung berdasarkan kode sortir dan nama cabang (tanpa atribut daerah).
- **Response Schema**:
```json
[
  {
    "code": "MA-01",
    "name": "Menara Agung Veteran"
  },
  {
    "code": "MA-02",
    "name": "Menara Agung Simpang Haru"
  },
  {
    "code": "MA-04",
    "name": "Menara Agung Bukittinggi"
  }
]
```

---

### 2. Serah Terima Berkas ke Dealer (Handover)
- **Endpoint**: `GET /api/handover`
- **Tujuan**: Menampilkan daftar penjemputan berkas BPKB per cabang dealer Menara Agung beserta status surat tanda terima.
- **Response Schema**:
```json
[
  {
    "id": "ST-2026-001",
    "dealerCode": "MA-02",
    "dealerName": "Menara Agung Simpang Haru",
    "documentCount": 24,
    "timestamp": "14:15 WIB",
    "status": "Selesai",
    "suratNumber": "SJ-MA/2026/042",
    "hasSignedPhoto": true,
    "notes": "Surat penyerahan 24 berkas BPKB telah ditandatangani dan difoto."
  },
  {
    "id": "ST-2026-003",
    "dealerCode": "MA-04",
    "dealerName": "Menara Agung Bukittinggi",
    "documentCount": 15,
    "timestamp": "Menunggu",
    "status": "Menunggu Penjemputan",
    "suratNumber": "SJ-MA/2026/045",
    "hasSignedPhoto": false,
    "notes": "15 berkas BPKB siap dijemput oleh perwakilan cabang Bukittinggi."
  }
]
```

- **Endpoint Upload Foto Surat**: `POST /api/handover/{id}/photo`
- **Body**: `multipart/form-data` (`photo: File`)
- **Tujuan**: Mengunggah foto fisik surat serah terima yang telah ditandatangani oleh pihak cabang yang menjemput berkas.
- **Response Schema**:
```json
{
  "success": true,
  "message": "Foto surat bertanda tangan berhasil diunggah",
  "photoUrl": "https://api.menaraagung.com/storage/handover/sj-042.jpg"
}
```

---

### 3. Berkas Revisi (Karantina & Koreksi BPKB)
- **Endpoint**: `GET /api/revisions`
- **Tujuan**: Menampilkan dokumen BPKB yang bermasalah saat pemindaian Samsat (misal: tinta Samsat tipis, nomor rangka buram, silau lampu) yang harus dipisahkan dari tumpukan dealer.
- **Response Schema**:
```json
[
  {
    "id": "REV-01",
    "bpkbNumber": "N-0834211",
    "ownerName": "Ahmad Fauzi",
    "vehiclePlate": "BA 3421 QA",
    "dealerName": "Menara Agung Simpang Haru",
    "issue": "Nomor rangka lembar 2 tidak terbaca jelas akibat tinta Samsat tipis.",
    "status": "Perlu Foto Ulang",
    "timestamp": "09:40 WIB"
  }
]
```

---

### 4. Grafik Performa Operator
- **Endpoint**: `GET /api/performance?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}`
- **Tujuan**: Menampilkan statistik analitik pencapaian kerja operator harian (Senin - Sabtu, 08:00 - 16:00), akumulasi mingguan, atau rentang tanggal kustom yang dipilih manual.
- **Response Schema**:
```json
{
  "summary": {
    "totalThisMonth": 1840,
    "targetThisMonth": 2200,
    "achievementPercentage": 84,
    "avgScanSeconds": 18,
    "accuracyRate": 99.2
  },
  "weekly": [
    {"day": "Sen", "completed": 92, "target": 100},
    {"day": "Sel", "completed": 98, "target": 100},
    {"day": "Rab", "completed": 85, "target": 100},
    {"day": "Kam", "completed": 95, "target": 100},
    {"day": "Jum", "completed": 78, "target": 100},
    {"day": "Sab", "completed": 84, "target": 100}
  ],
  "monthly": [
    {"month": "Mei", "total": 1950},
    {"month": "Jun", "total": 2100},
    {"month": "Jul", "total": 2050},
    {"month": "Agu", "total": 2180},
    {"month": "Sep", "total": 2240},
    {"month": "Okt", "total": 1840}
  ]
}
```

---

### 5. Ringkasan Aktivitas Hari Ini (Shift Productivity)
- **Endpoint**: `GET /api/activity`
- **Tujuan**: Mengisi semi-circular gauge target harian operator pada layar beranda.
- **Response Schema**:
```json
{
  "target_bpkb": 100,
  "completed_bpkb": 78,
  "pending_bpkb": 22,
  "timestamp": "2026-10-17T08:00:00Z"
}
```

---

### 6. Daftar Riwayat BPKB & Rekap Sortir
- **Endpoint**: `GET /api/bpkb/history?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&dealerCode={MA-XX}&search={keyword}`
- **Tujuan**: Menampilkan seluruh riwayat dokumen BPKB yang telah discan dan diproses oleh operator, mendukung filter rentang tanggal, filter cabang dealer, serta pencarian nomor BPKB/mesin/konsumen.
- **Response Schema**:
```json
[
  {
    "id": "trk_20261017_001",
    "no_mesin": "JM31E1928374",
    "no_bpkb": "N-0834211",
    "nama_konsumen": "Ahmad Fauzi",
    "dealer_code": "MA-01",
    "dealer_name": "Menara Agung Veteran",
    "status": "completed",
    "stage": "completed",
    "created_at": "2026-10-17 14:25:10",
    "pdf_url": "https://aciax.menara-agung.com/storage/pdf/N-0834211.pdf"
  }
]
```

---

### 7. Ringkasan Rekap Sortir per Dealer (Agregasi Meja Fisik)
- **Endpoint**: `GET /api/bpkb/sorting-summary`
- **Tujuan**: Memberikan agregasi jumlah berkas fisik yang saat ini sudah selesai discan dan sedang berada di meja sortir menunggu dijemput oleh masing-masing cabang.
- **Response Schema**:
```json
[
  {
    "dealer_code": "MA-01",
    "dealer_name": "Menara Agung Veteran",
    "total_ready": 32,
    "last_scan_at": "2026-10-17 14:25:10"
  },
  {
    "dealer_code": "MA-02",
    "dealer_name": "Menara Agung Simpang Haru",
    "total_ready": 24,
    "last_scan_at": "2026-10-17 13:52:45"
  },
  {
    "dealer_code": "MA-04",
    "dealer_name": "Menara Agung Bukittinggi",
    "total_ready": 15,
    "last_scan_at": "2026-10-17 10:20:15"
  }
]
```

---

## Panduan Logika Bisnis & Database untuk Tim Backend

Agar tim backend tidak perlu menebak-nebak (*trial-and-error*), berikut adalah pedoman logika alur data di database:

### A. Dari Mana Cabang Dealer Berasal?
1. Saat operator memindai BPKB, kamera membaca **Nomor Mesin** (`no_mesin`).
2. Backend mencocokkan `no_mesin` ke data master unit/Samsat:
   ```sql
   SELECT fk_dealer, nm_dealer FROM master_unit WHERE no_mesin = :no_mesin;
   ```
3. Kolom `fk_dealer` (misal: `MA-01`) dan `nm_dealer` disimpan ke dalam record dokumen BPKB (`bpkb_documents`).

### B. Kapan Berkas Masuk ke Rekap Sortir? (Siap Diambil)
- Ketika BPKB selesai diproses (`status = 'completed'` / `stage = 'completed'`) dan **belum pernah diserahterimakan** (`handover_id IS NULL`), berkas ini secara fisik berada di meja sortir kantor pusat.
- Logika Query Rekap Sortir:
  ```sql
  SELECT 
    dealer_code,
    dealer_name,
    COUNT(*) AS total_ready,
    MAX(created_at) AS last_scan_at
  FROM bpkb_documents
  WHERE status = 'completed' 
    AND (handover_id IS NULL OR handover_status = 'pending')
  GROUP BY dealer_code, dealer_name
  ORDER BY total_ready DESC;
  ```

### C. Kapan Berkas Berpindah Menjadi "Sudah Diambil"? (Serah Terima Selesai)
1. Pihak cabang dealer datang menjemput tumpukan berkas BPKB.
2. Surat tanda terima ditandatangani oleh perwakilan cabang.
3. Operator memfoto surat tersebut melalui menu **Serah Terima** (`POST /api/handover/{id}/photo`).
4. Backend menjalankan transaksi pembaruan:
   ```sql
   -- Mengikat semua berkas dealer yang bersangkutan dengan ID penyerahan
   UPDATE bpkb_documents 
   SET 
     handover_id = :handover_id,
     handover_status = 'completed',
     handed_over_at = NOW()
   WHERE dealer_code = :dealer_code 
     AND handover_id IS NULL;
   ```
5. Otomatis tumpukan pada **Rekap Sortir** untuk cabang tersebut akan ter-reset/berkurang sesuai berkas yang telah diserahkan.

---

### D. Logika Perhitungan & Query Statistik Performa Operator (`GET /api/performance`)

Endpoint ini menyuplai data analitik pencapaian operator pada layar **Grafik Performa**. Agar data akurat dan tidak memberatkan database, backend dapat menggunakan agregasi terindeks berikut:

#### 1. Ringkasan Kartu Metrik Utama (`summary`)
- **Default (Bulan Berjalan):**
  ```sql
  SELECT 
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS totalThisMonth,
    ROUND(AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(SECOND, created_at, updated_at) END)) AS avgScanSeconds,
    ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 1) AS accuracyRate
  FROM bpkb_documents
  WHERE created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01 00:00:00');
  ```
- **Jika Parameter `startDate` & `endDate` Diberikan:**
  Ganti klausul waktu dengan `created_at BETWEEN :startDate AND :endDate`.
- **Target Bulanan (`targetThisMonth`):**
  Dihitung dari konfigurasi target harian operator dikali jumlah hari kerja aktif dalam bulan/rentang tersebut (standar: 22 hari kerja x 100 berkas/hari = 2.200 berkas).
- **Persentase Pencapaian (`achievementPercentage`):**
  `ROUND((totalThisMonth / targetThisMonth) * 100)`.

#### 2. Agregasi Grafik Mingguan (`weekly`: Senin - Sabtu)
Jam kerja operasional pemindaian adalah Senin s/d Sabtu (08:00 - 16:00). Backend mengelompokkan jumlah berkas `completed` per hari pada minggu berjalan:

```sql
SELECT 
  DATE(created_at) AS tanggal,
  WEEKDAY(created_at) AS indeks_hari,
  COUNT(*) AS total_selesai
FROM bpkb_documents
WHERE status = 'completed'
  AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY)
  AND created_at < DATE_ADD(DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY), INTERVAL 6 DAY)
GROUP BY DATE(created_at), WEEKDAY(created_at)
ORDER BY indeks_hari ASC;
```

Backend memetakan hasil query ke dalam 6 slot array tetap (Senin s/d Sabtu). Hari yang belum memiliki transaksi diisi dengan `completed: 0`:
```json
[
  {"day": "Sen", "completed": 92, "target": 100},
  {"day": "Sel", "completed": 98, "target": 100},
  {"day": "Rab", "completed": 85, "target": 100},
  {"day": "Kam", "completed": 95, "target": 100},
  {"day": "Jum", "completed": 78, "target": 100},
  {"day": "Sab", "completed": 84, "target": 100}
]
```

#### 3. Tren 6 Bulan Terakhir (`monthly`)
Mengambil akumulasi berkas selesai dari 5 bulan lalu hingga bulan berjalan:

```sql
SELECT 
  DATE_FORMAT(created_at, '%Y-%m') AS periode_bulan,
  COUNT(*) AS total_selesai
FROM bpkb_documents
WHERE status = 'completed'
  AND created_at >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01 00:00:00'), INTERVAL 5 MONTH)
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY periode_bulan ASC;
```

Backend memformat label bulan ke format singkat bahasa Indonesia (`Mei`, `Jun`, `Jul`, `Agu`, `Sep`, `Okt`) dengan target visual skala penuh 2.400 berkas.

#### 4. Contoh Referensi Controller Backend (Laravel)

```php
public function getPerformance(Request $request)
{
    $startDate = $request->query('startDate');
    $endDate = $request->query('endDate');

    $isCustomRange = !empty($startDate) && !empty($endDate);
    $rangeStart = $isCustomRange ? Carbon::parse($startDate)->startOfDay() : now()->startOfMonth();
    $rangeEnd = $isCustomRange ? Carbon::parse($endDate)->endOfDay() : now()->endOfMonth();

    $summaryData = DB::table('bpkb_documents')
        ->whereBetween('created_at', [$rangeStart, $rangeEnd])
        ->selectRaw("
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(*) as total_count,
            AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(SECOND, created_at, updated_at) END) as avg_seconds
        ")
        ->first();

    $target = $isCustomRange ? 550 : 2200;
    $completed = $summaryData->completed_count ?? 0;
    $achievement = $target > 0 ? round(($completed / $target) * 100) : 0;
    $avgScan = round($summaryData->avg_seconds ?? 18);
    $accuracy = ($summaryData->total_count ?? 0) > 0 
        ? round(($completed / $summaryData->total_count) * 100, 1) 
        : 100.0;

    $mondayThisWeek = now()->startOfWeek(Carbon::MONDAY);
    $weeklyRaw = DB::table('bpkb_documents')
        ->where('status', 'completed')
        ->whereBetween('created_at', [$mondayThisWeek, (clone $mondayThisWeek)->addDays(6)->endOfDay()])
        ->selectRaw('WEEKDAY(created_at) as day_idx, COUNT(*) as cnt')
        ->groupBy('day_idx')
        ->pluck('cnt', 'day_idx')
        ->toArray();

    $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    $weekly = [];
    foreach ($dayLabels as $idx => $label) {
        $weekly[] = [
            'day' => $label,
            'completed' => $weeklyRaw[$idx] ?? 0,
            'target' => 100
        ];
    }

    $monthlyRaw = DB::table('bpkb_documents')
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
        ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(*) as cnt")
        ->groupBy('ym')
        ->orderBy('ym', 'asc')
        ->pluck('cnt', 'ym')
        ->toArray();

    $monthNamesId = [
        '01' => 'Jan', '02' => 'Feb', '03' => 'Mar', '04' => 'Apr',
        '05' => 'Mei', '06' => 'Jun', '07' => 'Jul', '08' => 'Agu',
        '09' => 'Sep', '10' => 'Okt', '11' => 'Nov', '12' => 'Des'
    ];

    $monthly = [];
    for ($i = 5; $i >= 0; $i--) {
        $mDate = now()->subMonths($i);
        $ymKey = $mDate->format('Y-m');
        $mNum = $mDate->format('m');
        $monthly[] = [
            'month' => $monthNamesId[$mNum] ?? $mDate->format('M'),
            'total' => $monthlyRaw[$ymKey] ?? 0
        ];
    }

    return response()->json([
        'status' => true,
        'summary' => [
            'totalThisMonth' => $completed,
            'targetThisMonth' => $target,
            'achievementPercentage' => $achievement,
            'avgScanSeconds' => $avgScan,
            'accuracyRate' => $accuracy,
        ],
        'weekly' => $weekly,
        'monthly' => $monthly,
    ]);
}
```
