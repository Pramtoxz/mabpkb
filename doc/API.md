# ACIAX API Documentation

## Base URL

```
http://your-server:8000/api
```

## Authentication

Semua endpoint API memerlukan header `SECRET-KEY`:

```http
SECRET-KEY: U2FsdGVkX19jfmhRGNeUJ2TITVhrP0hzNJ9HNv81qSs=
```

> ⚠️ Gunakan **hyphen** (`SECRET-KEY`), bukan underscore (`SECRET_KEY`). Apache & Nginx secara default menghapus header dengan underscore.

---

## Endpoints

### 1. Get Dealer

Mencari dealer berdasarkan nomor mesin.

```http
GET /api/get-dealer?nomesin={nomesin}
```

**Parameter (Query):**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `nomesin` | string | ✅ | Nomor mesin kendaraan |

**Response:**

```json
{
  "fk_dealer": "DLR001",
  "nm_dealer": "Dealer Maju Jaya"
}
```

---

### 2. Process BPKB

Membuat PDF BPKB dan memproses data secara asynchronous (queued job).

```http
POST /api/bpkb/process
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nomesin` | string | ✅ | Nomor mesin (max 16 karakter, harus ada di database) |
| `nobpkb` | string | ✅ | Nomor BPKB (max 20 karakter) |
| `images` | file[4] | ✅ | Tepat 4 gambar (jpeg/png/jpg, max 1MB per file) |

**Response (202 Accepted):**

```json
{
  "message": "BPKB sedang diproses.",
  "track_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Error Response (422):**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nomesin": ["Nomor Mesin tidak ditemukan di database."],
    "images": ["Harus mengunggah tepat 4 gambar."]
  }
}
```

---

### 3. Track Status (One-time)

Mendapatkan status proses BPKB sekali (polling).

```http
GET /api/bpkb/track/{track_id}
```

**Response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "no_mesin": "ABC123456",
  "no_bpkb": "1234567890",
  "nama_konsumen": "John Doe",
  "pdf_path": "bpkb/pdf/John Doe.pdf",
  "image_paths": null,
  "stage": "completed",
  "status": "completed",
  "error_message": null,
  "created_at": "2026-07-06T10:00:00.000000Z",
  "updated_at": "2026-07-06T10:00:15.000000Z"
}
```

**Status Values:**
| Status | Description |
|--------|-------------|
| `queued` | Masih dalam antrian |
| `processing` | Sedang diproses |
| `completed` | Selesai |
| `failed` | Gagal |

**Stage Values:**
| Stage | Description |
|-------|-------------|
| `pending` | Menunggu diproses |
| `create_pdf` | Kompresi gambar & generate PDF |
| `update_stok_unit` | Simpan nomor BPKB ke stok unit |
| `update_tgl_bpkb_siap` | Set tanggal BPKB siap |
| `completed` | Semua proses selesai |

---

### 4. Track Stream (Realtime - SSE)

Mendapatkan update realtime menggunakan Server-Sent Events.

```http
GET /api/bpkb/track/{track_id}/stream
```

> ⚠️ EventSource tidak bisa mengirim custom headers. Gunakan query parameter `secret_key`.

**Response (text/event-stream):**

```
data: {"stage":"create_pdf","status":"processing","pdf_url":null,"error_message":null}

data: {"stage":"update_stok_unit","status":"processing","pdf_url":null,"error_message":null}

data: {"stage":"update_tgl_bpkb_siap","status":"processing","pdf_url":null,"error_message":null}

data: {"stage":"completed","status":"completed","pdf_url":"http://server:8000/storage/bpkb/pdf/John Doe.pdf","error_message":null}
```

---

## React Native Implementation

### Dependencies

```bash
npm install axios react-native-event-source
```

### Config API

```typescript
// src/config/api.ts
import axios from 'axios';

const API_BASE = 'http://your-server:8000/api';
const SECRET_KEY = 'U2FsdGVkX19jfmhRGNeUJ2TITVhrP0hzNJ9HNv81qSs=';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'SECRET-KEY': SECRET_KEY,
    Accept: 'application/json',
  },
});
```

### Service Layer

```typescript
// src/services/bpkbService.ts
import { api } from '../config/api';

interface Dealer {
  fk_dealer: string;
  nm_dealer: string;
}

interface BpkbTrack {
  id: string;
  no_mesin: string;
  no_bpkb: string;
  nama_konsumen: string | null;
  pdf_path: string | null;
  stage: string;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Get dealer by nomor mesin
export const getDealer = async (nomesin: string): Promise<Dealer> => {
  const { data } = await api.get<Dealer>('/get-dealer', {
    params: { nomesin },
  });
  return data;
};

// Process BPKB (upload 4 images + data)
export const processBpkb = async (
  nomesin: string,
  nobpkb: string,
  images: { uri: string; type: string; name: string }[],
): Promise<{ message: string; track_id: string }> => {
  const formData = new FormData();
  formData.append('nomesin', nomesin);
  formData.append('nobpkb', nobpkb);

  images.forEach((img, index) => {
    formData.append('images[]', {
      uri: img.uri,
      type: img.type || 'image/jpeg',
      name: img.name || `image_${index}.jpg`,
    } as any);
  });

  const { data } = await api.post('/bpkb/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Track status (one-time polling)
export const getTrackStatus = async (trackId: string): Promise<BpkbTrack> => {
  const { data } = await api.get<BpkbTrack>(`/bpkb/track/${trackId}`);
  return data;
};
```

### SSE Hook (Realtime Tracking)

```typescript
// src/hooks/useBpkbStream.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { EventSource } from 'react-native-event-source';

const API_BASE = 'http://your-server:8000/api';
const SECRET_KEY = 'U2FsdGVkX19jfmhRGNeUJ2TITVhrP0hzNJ9HNv81qSs=';

interface StreamData {
  stage: string;
  status: string;
  pdf_url: string | null;
  error_message: string | null;
}

export function useBpkbStream(trackId: string | null) {
  const [data, setData] = useState<StreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!trackId) return;

    const url = `${API_BASE}/bpkb/track/${trackId}/stream?secret_key=${SECRET_KEY}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('open', () => setConnected(true));

    es.addEventListener('message', (event: any) => {
      const parsed: StreamData = JSON.parse(event.data);
      setData(parsed);

      // Auto-close when done
      if (parsed.status === 'completed' || parsed.status === 'failed') {
        disconnect();
      }
    });

    es.addEventListener('error', () => {
      setConnected(false);
      disconnect();
    });

    return () => disconnect();
  }, [trackId, disconnect]);

  return { data, connected, disconnect };
}
```

### Example Screen: Process BPKB

```tsx
// src/screens/ProcessBpkbScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { processBpkb } from '../services/bpkbService';
import { useBpkbStream } from '../hooks/useBpkbStream';

const STAGE_LABELS: Record<string, string> = {
  pending: 'Menunggu...',
  create_pdf: 'Membuat PDF...',
  update_stok_unit: 'Update Stok Unit...',
  update_tgl_bpkb_siap: 'Update Tanggal BPKB Siap...',
  completed: 'Selesai!',
  failed: 'Gagal',
};

export default function ProcessBpkbScreen() {
  const [nomesin, setNomesin] = useState('');
  const [nobpkb, setNobpkb] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // SSE realtime hook
  const { data: streamData, connected } = useBpkbStream(trackId);

  const pickImages = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 4,
    });
    if (result.assets && result.assets.length === 4) {
      setImages(result.assets);
    } else {
      Alert.alert('Error', 'Pilih tepat 4 gambar');
    }
  };

  const handleSubmit = async () => {
    if (images.length !== 4) {
      Alert.alert('Error', 'Pilih tepat 4 gambar');
      return;
    }

    setLoading(true);
    try {
      const result = await processBpkb(
        nomesin,
        nobpkb,
        images.map((img, i) => ({
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `image_${i}.jpg`,
        })),
      );
      setTrackId(result.track_id);
    } catch (err: any) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.message;
      Alert.alert('Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Proses BPKB
      </Text>

      <Text>Nomor Mesin</Text>
      <TextInput
        value={nomesin}
        onChangeText={setNomesin}
        placeholder="Masukkan nomor mesin"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />

      <Text>Nomor BPKB</Text>
      <TextInput
        value={nobpkb}
        onChangeText={setNobpkb}
        placeholder="Masukkan nomor BPKB"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />

      <Button title="Pilih 4 Gambar" onPress={pickImages} />

      {images.length > 0 && (
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}
        >
          {images.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.uri }}
              style={{ width: 80, height: 80, margin: 4, borderRadius: 8 }}
            />
          ))}
        </View>
      )}

      <Button
        title={loading ? 'Mengirim...' : 'Proses BPKB'}
        onPress={handleSubmit}
        disabled={loading}
      />

      {/* Realtime Progress */}
      {trackId && (
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: '#f0f9ff',
            borderRadius: 12,
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Status: {streamData?.status || 'queued'} {connected ? '🟢' : '🔴'}
          </Text>
          <Text>Stage: {STAGE_LABELS[streamData?.stage || 'pending']}</Text>

          {streamData?.status === 'completed' && streamData.pdf_url && (
            <Button
              title="Download PDF"
              onPress={() => {
                // Open PDF URL or download
                console.log('PDF URL:', streamData.pdf_url);
              }}
            />
          )}

          {streamData?.error_message && (
            <Text style={{ color: 'red', marginTop: 8 }}>
              {streamData.error_message}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
```

### Example Screen: Get Dealer

```tsx
// src/screens/DealerScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { getDealer } from '../services/bpkbService';

export default function DealerScreen() {
  const [nomesin, setNomesin] = useState('');
  const [dealer, setDealer] = useState<{
    fk_dealer: string;
    nm_dealer: string;
  } | null>(null);

  const handleSearch = async () => {
    try {
      const data = await getDealer(nomesin);
      setDealer(data);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Dealer tidak ditemukan',
      );
      setDealer(null);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Cari Dealer
      </Text>

      <Text>Nomor Mesin</Text>
      <TextInput
        value={nomesin}
        onChangeText={setNomesin}
        placeholder="Masukkan nomor mesin"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />

      <Button title="Cari" onPress={handleSearch} />

      {dealer && (
        <View
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: '#f0f9ff',
            borderRadius: 12,
          }}
        >
          <Text>Kode Dealer: {dealer.fk_dealer}</Text>
          <Text>Nama Dealer: {dealer.nm_dealer}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## Error Codes

| Code  | Description                               |
| ----- | ----------------------------------------- |
| `200` | Success                                   |
| `202` | Accepted (queued for processing)          |
| `401` | Unauthorized (invalid/missing SECRET_KEY) |
| `404` | Track not found                           |
| `422` | Validation error                          |
| `500` | Server error                              |

---

## Notes

- `SECRET_KEY` dikirim via header untuk semua request biasa, atau via query param `?secret_key=...` untuk SSE
- Images harus tepat 4 file, format JPEG/PNG/JPG, max 1MB per file
- `track_id` berupa UUID, simpan untuk tracking status
- PDF tersedia di `{BASE_URL}/storage/{pdf_path}` setelah status `completed`
- SSE connection otomatis tertutup saat status `completed` atau `failed`
