# ACIAX API Documentation

Base URL: `http://localhost:8000/api`

---

## Autentikasi

Semua API route dilindungi middleware `CheckSecretKey`. Sertakan header di setiap request:

```
SECRET-KEY: {your-secret-key}
```

Nilai key dikonfigurasi di env `SECRET_KEY` (`config/app.php`).

Selain header, juga bisa dikirim via query parameter `?secret_key={your-secret-key}`.

---

## Daftar Endpoint

| Method | Endpoint                         | Deskripsi                           |
| ------ | -------------------------------- | ----------------------------------- |
| GET    | `/api/get-dealer`                | Cari dealer berdasarkan nomor mesin |
| POST   | `/api/bpkb/process`              | Proses BPKB (upload gambar + data)  |
| GET    | `/api/bpkb/track/{track}`        | Lacak status proses BPKB            |
| GET    | `/api/bpkb/track/{track}/stream` | Stream status BPKB via SSE          |
| GET    | `/api/activity`                  | Ringkasan aktivitas BPKB bulanan    |

---

## 1. GET `/api/get-dealer`

Cari data dealer berdasarkan nomor mesin unit. Query join dari tabel `H1_DOS.stokunit` dan `public.tbldealer` di database `pgsql_nms`.

### Query Parameters

| Param     | Type   | Required | Deskripsi             |
| --------- | ------ | -------- | --------------------- |
| `nomesin` | string | Ya       | Nomor mesin kendaraan |

### Contoh Request

```bash
curl -X GET "http://localhost:8000/api/get-dealer?nomesin=MH1234567890"
```

### Response

**200 OK**

```json
{
  "fk_dealer": "DLR001",
  "nm_dealer": "Menara Agung Jakarta"
}
```

**200 OK (tidak ditemukan)**

```json
null
```

---

## 2. POST `/api/bpkb/process`

Proses pembuatan PDF BPKB. Upload 4 gambar halaman BPKB beserta data mesin dan nomor BPKB. Proses dilakukan secara asinkron melalui queue job.

### Content-Type

`multipart/form-data`

### Body

| Field     | Type   | Required | Validasi                                        | Deskripsi             |
| --------- | ------ | -------- | ----------------------------------------------- | --------------------- |
| `nomesin` | string | Ya       | max:16, exists di `pgsql_nms.stokunit.no_mesin` | Nomor mesin kendaraan |
| `nobpkb`  | string | Ya       | max:20                                          | Nomor BPKB            |
| `images`  | file[] | Ya       | size:4, jpeg/png/jpg, max 1048KB per file       | 4 gambar halaman BPKB |

### Contoh Request

```bash
curl -X POST http://localhost:8000/api/bpkb/process \
  -F "nomesin=MH1234567890" \
  -F "nobpkb=BPKB-2026-001" \
  -F "images=@page1.jpg" \
  -F "images=@page2.jpg" \
  -F "images=@page3.jpg" \
  -F "images=@page4.jpg"
```

### Response

**202 Accepted**

```json
{
  "message": "BPKB sedang diproses.",
  "track_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**422 Validation Error**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nomesin": ["Nomor Mesin tidak ditemukan di database."],
    "images": ["Harus mengunggah tepat 4 gambar."]
  }
}
```

### Pesan Validasi (Bahasa Indonesia)

| Rule                | Pesan                                           |
| ------------------- | ----------------------------------------------- |
| `nomesin.required`  | Nomor Mesin harus diisi.                        |
| `nomesin.string`    | Nomor Mesin harus berupa string.                |
| `nomesin.max`       | Nomor Mesin tidak boleh lebih dari 16 karakter. |
| `nomesin.exists`    | Nomor Mesin tidak ditemukan di database.        |
| `nobpkb.required`   | Nomor BPKB harus diisi.                         |
| `nobpkb.string`     | Nomor BPKB harus berupa string.                 |
| `nobpkb.max`        | Nomor BPKB tidak boleh lebih dari 20 karakter.  |
| `images.required`   | Gambar harus diunggah.                          |
| `images.array`      | Gambar harus berupa array.                      |
| `images.size`       | Harus mengunggah tepat 4 gambar.                |
| `images.*.required` | Setiap gambar harus diunggah.                   |
| `images.*.image`    | File yang diunggah harus berupa gambar.         |
| `images.*.mimes`    | Gambar harus berformat JPEG, PNG, atau JPG.     |
| `images.*.max`      | Ukuran gambar tidak boleh lebih dari 1 MB.      |

### Proses Asinkron (Queue Job)

Setelah response 202, proses berjalan di background dengan 3 stage (max 3 retries):

| Stage                  | Aksi                                                                        | Database      |
| ---------------------- | --------------------------------------------------------------------------- | ------------- |
| `create_pdf`           | Kompresi gambar & generate PDF BPKB, lalu hapus gambar temp                 | Local storage |
| `update_stok_unit`     | Simpan `no_bpkb` ke `tblstock_unit`                                         | pgsql_meta    |
| `update_tgl_bpkb_siap` | Set `tgl_bpkb_siap = now()` di `tblterima_bpkb` via `tblterima_bpkb_detail` | pgsql_meta    |

Status proses: `queued` → `processing` → `completed` / `failed`

Gunakan `track_id` dari response untuk memantau progres via endpoint track.

---

## 3. GET `/api/bpkb/track/{track}`

Lacak status dan progres pemrosesan BPKB.

### Path Parameters

| Param   | Type | Required | Deskripsi                                     |
| ------- | ---- | -------- | --------------------------------------------- |
| `track` | UUID | Ya       | ID tracking dari response `/api/bpkb/process` |

### Contoh Request

```bash
curl -X GET http://localhost:8000/api/bpkb/track/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Response

**200 OK (Processing)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "no_mesin": "MH1234567890",
  "no_bpkb": "BPKB-2026-001",
  "nama_konsumen": "Budi Santoso",
  "pdf_path": null,
  "image_paths": [
    "bpkb/temp/page1.jpg",
    "bpkb/temp/page2.jpg",
    "bpkb/temp/page3.jpg",
    "bpkb/temp/page4.jpg"
  ],
  "stage": "create_pdf",
  "status": "processing",
  "error_message": null,
  "created_at": "2026-07-06T02:58:30.000000Z",
  "updated_at": "2026-07-06T02:58:35.000000Z"
}
```

**200 OK (Completed)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "no_mesin": "MH1234567890",
  "no_bpkb": "BPKB-2026-001",
  "nama_konsumen": "Budi Santoso",
  "pdf_path": "bpkb/pdf/Budi Santoso.pdf",
  "image_paths": null,
  "stage": "completed",
  "status": "completed",
  "error_message": null,
  "created_at": "2026-07-06T02:58:30.000000Z",
  "updated_at": "2026-07-06T03:00:15.000000Z"
}
```

**200 OK (Failed)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "no_mesin": "MH1234567890",
  "no_bpkb": "BPKB-2026-001",
  "nama_konsumen": "Budi Santoso",
  "pdf_path": null,
  "image_paths": null,
  "stage": "update_stok_unit",
  "status": "failed",
  "error_message": "Connection to database pgsql_meta failed.",
  "created_at": "2026-07-06T02:58:30.000000Z",
  "updated_at": "2026-07-06T02:59:45.000000Z"
}
```

**404 Not Found**

```json
{
  "message": "No query results for model [App\\Models\\BpkbProcessTrack]."
}
```

### Field Reference

| Field           | Type           | Deskripsi                                                                                                                                                   |
| --------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | UUID           | ID unik tracking                                                                                                                                            |
| `no_mesin`      | string         | Nomor mesin kendaraan                                                                                                                                       |
| `no_bpkb`       | string         | Nomor BPKB                                                                                                                                                  |
| `nama_konsumen` | string\|null   | Nama konsumen dari DB stok unit (`nm_customer`)                                                                                                             |
| `pdf_path`      | string\|null   | Path file PDF hasil (akses via `/storage/{pdf_path}`)                                                                                                       |
| `image_paths`   | string[]\|null | Path gambar yang diupload (null setelah cleanup)                                                                                                            |
| `stage`         | string         | Stage saat ini: `pending`, `create_pdf`, `update_stok_unit`, `update_tgl_bpkb_siap`, `completed` (saat gagal, stage tetap di posisi terakhir sebelum error) |
| `status`        | string         | Status proses: `queued`, `processing`, `completed`, `failed`                                                                                                |
| `error_message` | string\|null   | Pesan error jika gagal                                                                                                                                      |
| `created_at`    | timestamp      | Waktu pembuatan record                                                                                                                                      |
| `updated_at`    | timestamp      | Waktu terakhir update                                                                                                                                       |

---

## 4. GET `/api/bpkb/track/{track}/stream`

Stream status pemrosesan BPKB secara real-time menggunakan **Server-Sent Events (SSE)**. Endpoint ini melakukan polling database setiap iterasi dan mengirim event saat `stage` atau `status` berubah. Stream otomatis berhenti ketika status `completed` atau `failed`.

### Path Parameters

| Param   | Type | Required | Deskripsi                                     |
| ------- | ---- | -------- | --------------------------------------------- |
| `track` | UUID | Ya       | ID tracking dari response `/api/bpkb/process` |

### Contoh Request

```bash
curl -X GET http://localhost:8000/api/bpkb/track/a1b2c3d4-e5f6-7890-abcd-ef1234567890/stream \
  -H "Accept: text/event-stream"
```

### Contoh dengan JavaScript (EventSource)

```javascript
const trackId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const source = new EventSource(`/api/bpkb/track/${trackId}/stream`);

source.onmessage = event => {
  const data = JSON.parse(event.data);
  console.log('Stage:', data.stage, 'Status:', data.status);
  if (data.pdf_url) console.log('PDF:', data.pdf_url);
  if (data.status === 'completed' || data.status === 'failed') {
    source.close();
  }
};
```

### Response (SSE Stream)

```
data: {"stage":"create_pdf","status":"processing","pdf_url":null,"error_message":null}

data: {"stage":"update_stok_unit","status":"processing","pdf_url":"http://localhost:8000/storage/bpkb/pdf/Budi Santoso.pdf","error_message":null}

data: {"stage":"completed","status":"completed","pdf_url":"http://localhost:8000/storage/bpkb/pdf/Budi Santoso.pdf","error_message":null}
```

### SSE Data Fields

| Field           | Type         | Deskripsi                                               |
| --------------- | ------------ | ------------------------------------------------------- |
| `stage`         | string       | Stage saat ini                                          |
| `status`        | string       | Status proses                                           |
| `pdf_url`       | string\|null | URL lengkap PDF (tersedia setelah `create_pdf` selesai) |
| `error_message` | string\|null | Pesan error jika gagal                                  |

### Response Headers

| Header              | Value               |
| ------------------- | ------------------- |
| `Content-Type`      | `text/event-stream` |
| `Cache-Control`     | `no-cache`          |
| `Connection`        | `keep-alive`        |
| `X-Accel-Buffering` | `no`                |

---

## 5. GET `/api/activity`

Ringkasan aktivitas BPKB untuk bulan berjalan. Menghitung target BPKB dari `tblterima_bpkb` dan BPKB yang sudah selesai dari tracking.

### Contoh Request

```bash
curl -X GET http://localhost:8000/api/activity
```

### Response

**200 OK**

```json
{
  "target_bpkb": 150,
  "completed_bpkb": 42,
  "pending_bpkb": 108
}
```

### Field Reference

| Field            | Type    | Deskripsi                                           |
| ---------------- | ------- | --------------------------------------------------- |
| `target_bpkb`    | integer | Total target BPKB bulan ini dari `tblterima_bpkb`   |
| `completed_bpkb` | integer | Total BPKB yang sudah selesai diproses              |
| `pending_bpkb`   | integer | Sisa BPKB yang belum selesai (`target - completed`) |

---

## Download PDF

Setelah status `completed`, file PDF dapat diakses melalui:

```
GET /storage/{pdf_path}
```

Contoh:

```
GET /storage/bpkb/pdf/Budi Santoso.pdf
```

Pastikan sudah menjalankan:

```bash
php artisan storage:link
```
