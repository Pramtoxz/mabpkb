import {
  OpenCV,
  Mat,
  Rect,
  Size,
  MatVector,
  ColorConversionCodes,
  RetrievalModes,
  ContourApproximationModes,
} from 'react-native-fast-opencv';

const MIN_CONTOUR_AREA_RATIO = 0.15;

export interface ScanResult {
  uri: string;
  borderDetected: boolean;
}

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onloadend = () => {
      const result = reader.result;
      const base64 =
        typeof result === 'string' ? result.split(',')[1] : undefined;
      if (!base64) {
        reject(new Error('Format base64 tidak valid.'));
        return;
      }
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Deteksi border dokumen lalu crop ke bounding-box kontur terbesar.
 * Ini BUKAN perspective-warp penuh (belum ada koreksi skew/rotasi) —
 * sengaja disederhanakan karena belum bisa diverifikasi di device asli
 * (lihat diskus.md Bagian 6). Selalu fallback ke foto asli kalau contour
 * tidak ditemukan atau proses OpenCV gagal, sesuai aturan "jangan block
 * proses" — tidak pernah melempar error ke pemanggil.
 */
export async function processScanImage(uri: string): Promise<ScanResult> {
  const releasables: Array<{release: () => void}> = [];
  const track = <T extends {release: () => void}>(obj: T): T => {
    releasables.push(obj);
    return obj;
  };
  const releaseAll = () => {
    for (const obj of releasables) {
      try {
        obj.release();
      } catch {
        // ignore — best-effort native cleanup
      }
    }
  };

  try {
    const base64 = await uriToBase64(uri);
    const src = track(Mat.createFromBase64(base64));
    const totalArea = src.cols * src.rows;

    const gray = track(Mat.create());
    OpenCV.cvtColor(src, gray, ColorConversionCodes.COLOR_BGR2GRAY);

    const blurSize = track(Size.create(5, 5));
    const blurred = track(Mat.create());
    OpenCV.GaussianBlur(gray, blurred, blurSize, 0);

    const edges = track(Mat.create());
    OpenCV.Canny(blurred, edges, 75, 200);

    const contours = track(MatVector.create());
    OpenCV.findContours(
      edges,
      contours,
      RetrievalModes.RETR_LIST,
      ContourApproximationModes.CHAIN_APPROX_SIMPLE,
    );

    let bestArea = 0;
    let bestRect: Rect | null = null;

    for (let i = 0; i < contours.length; i++) {
      const contour = contours.get(i);
      const {value: area} = OpenCV.contourArea(contour, false);
      if (area < totalArea * MIN_CONTOUR_AREA_RATIO || area <= bestArea) {
        continue;
      }
      bestArea = area;
      bestRect = OpenCV.boundingRect(contour);
    }

    if (!bestRect) {
      releaseAll();
      return {uri, borderDetected: false};
    }
    track(bestRect);

    const cropped = track(Mat.create());
    OpenCV.crop(src, cropped, bestRect);

    // Enhance "scan look": naikkan kontras & brightness tipis, tetap warna
    // (bukan B&W/threshold — cap/tanda tangan warna harus tetap terlihat).
    const enhanced = track(Mat.create());
    OpenCV.convertScaleAbs(cropped, enhanced, 1.15, 8);

    const outputPath = uri
      .replace('file://', '')
      .replace(/\.jpe?g$/i, '_scan.jpg');
    enhanced.saveToFile(outputPath);
    releaseAll();

    return {uri: `file://${outputPath}`, borderDetected: true};
  } catch {
    // Fallback wajib (Bagian 6.4): jangan pernah blok proses kalau OpenCV gagal.
    releaseAll();
    return {uri, borderDetected: false};
  }
}
