# Fix Volume Key Not Working When Camera Active

## Problem

`react-native-volume-manager@2.0.8` menggunakan `contentView.setOnKeyListener()` untuk mendengarkan hardware volume key. Saat `react-native-camera-kit` camera view aktif, camera view mencuri focus dari `contentView`, menyebabkan volume key listener berhenti bekerja. Listener hanya pulih setelah keluar dan masuk kembali ke app (karena `onHostResume()` memanggil `requestFocus()` ulang).

## Root Cause (Verified)

File: `node_modules/react-native-volume-manager/android/.../VolumeManagerModule.java`

- `setupKeyListener()` (line 102) memasang `contentView.setOnKeyListener()` — ini adalah **VIEW-LEVEL** listener
- View-level key listener HANYA bekerja saat view tersebut memiliki focus
- Camera view mengambil focus → volume key event tidak pernah sampai ke `contentView`
- `onHostResume()` memanggil `contentView.requestFocus()` → makanya bekerja setelah keluar-masuk app

## Solution

Override `dispatchKeyEvent()` di `MainActivity.kt`. Ini adalah **ACTIVITY-LEVEL** intercept — menangkap SEMUA key event SEBELUM view manapun meng-consume. Tidak ada masalah focus.

## Implementation Steps

### 1. Edit `MainActivity.kt`

Path: `android/app/src/main/java/com/mabpkb/MainActivity.kt`

Tambahkan `dispatchKeyEvent` override yang:
- Menangkap `KEYCODE_VOLUME_DOWN` DAN `KEYCODE_VOLUME_UP` pada `ACTION_DOWN`
- Emit event `DeviceEventManagerModule.RCTDeviceEventEmitter` (nama event: `"onHardwareKeyPress"`) ke JavaScript
- Return `true` untuk consume event (mencegah system volume UI muncul)
- Semua key lain diteruskan ke `super.dispatchKeyEvent(event)`

Import yang diperlukan:
```kotlin
import android.view.KeyEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
```

Akses React context via `reactDelegate` atau `reactInstanceManager.currentReactContext` — **verifikasi API mana yang tersedia di RN 0.86 New Architecture**. Gunakan Context7 MCP untuk cek `ReactActivity` API React Native 0.86 untuk mengakses React context dari `MainActivity`.

### 2. Buat `src/hooks/useHardwareKey.ts`

Gantikan `useVolumeKey.ts` yang bergantung pada `react-native-volume-manager`. Hook baru harus:
- Menggunakan `DeviceEventEmitter.addListener('onHardwareKeyPress', ...)` dari `react-native`
- Menerima callback dan enabled flag, API sama dengan `useVolumeKey` saat ini
- Gunakan refs untuk callback dan enabled agar tidak terjadi stale closures

### 3. Update `src/contexts/PedalContext.tsx`

Saat ini import `VolumeManager` dari `react-native-volume-manager`. Ganti dengan:
- `DeviceEventEmitter` dari `react-native`
- Listen event `'onHardwareKeyPress'` menggantikan `VolumeManager.addVolumeListener()`

### 4. Verifikasi Scan Screens

File di `src/screens/scan/`:
- ScanStep1Screen.tsx
- ScanStep2Screen.tsx
- ScanStep3Screen.tsx
- ScanStep4Screen.tsx
- ReviewScreen.tsx

Screen-screen ini sudah menggunakan `usePedal()` dari PedalContext — pastikan tidak ada yang langsung import `useVolumeKey` atau `react-native-volume-manager`.

### 5. Test

Tes utama: buka ScanStep screen manapun (kamera terlihat), tekan tombol volume hardware → capture harus trigger TANPA perlu keluar-masuk app.

## Important Notes

- Gunakan Context7 MCP untuk verifikasi `ReactActivity` API di RN 0.86 — method untuk akses React context mungkin berbeda antara old arch dan new arch
- JANGAN hapus `react-native-volume-manager` dari package.json dulu — bagian lain mungkin masih pakai volume level API-nya. Hanya berhenti menggunakannya untuk key listening.
- Bluetooth pedal/shutter mungkin mengirim VOLUME_UP bukan VOLUME_DOWN — handle KEDUA `KEYCODE_VOLUME_UP` dan `KEYCODE_VOLUME_DOWN` di `dispatchKeyEvent`
- Return `true` dari dispatchKeyEvent untuk volume keys agar menekan popup system volume overlay
- Project menggunakan New Architecture (Fabric) — cek `fabricEnabled` di build.gradle

## Files to Modify

1. `android/app/src/main/java/com/mabpkb/MainActivity.kt` — tambah dispatchKeyEvent
2. `src/hooks/useHardwareKey.ts` — hook baru (atau rename useVolumeKey.ts)
3. `src/contexts/PedalContext.tsx` — ganti dari VolumeManager ke DeviceEventEmitter
4. Verifikasi scan screens tidak perlu perubahan

## Verification

Setelah perubahan, jalankan `npx react-native run-android` di device fisik. Buka Camera tab → tekan tombol volume → foto harus langsung ter-capture tanpa perlu keluar-masuk app.
