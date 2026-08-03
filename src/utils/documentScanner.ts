import {
  OpenCV,
  Mat,
  Rect,
  Size,
  MatVector,
  DataTypes,
  ColorConversionCodes,
  RetrievalModes,
  ContourApproximationModes,
} from 'react-native-fast-opencv';
import RNFS from 'react-native-fs';

const MIN_CONTOUR_AREA_RATIO = 0.15;

export interface ScanResult {
  uri: string;
  borderDetected: boolean;
}

function uriToFilePath(uri: string): string {
  return uri.replace('file://', '');
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
    const filePath = uriToFilePath(uri);
    const base64 = await RNFS.readFile(filePath, 'base64');

    const src = track(Mat.createFromBase64(base64));

    if (src.rows === 0 || src.cols === 0) {
      releaseAll();
      return {uri, borderDetected: false};
    }

    const totalArea = src.cols * src.rows;

    const gray = track(Mat.create(src.rows, src.cols, DataTypes.CV_8UC1));
    OpenCV.cvtColor(src, gray, ColorConversionCodes.COLOR_BGR2GRAY);

    const blurSize = track(Size.create(5, 5));
    const blurred = track(Mat.create(gray.rows, gray.cols, DataTypes.CV_8UC1));
    OpenCV.GaussianBlur(gray, blurred, blurSize, 0);

    const edges = track(Mat.create(gray.rows, gray.cols, DataTypes.CV_8UC1));
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

    const cropped = track(Mat.create(bestRect.height, bestRect.width, DataTypes.CV_8UC3));
    OpenCV.crop(src, cropped, bestRect);

    const enhanced = track(Mat.create(bestRect.height, bestRect.width, DataTypes.CV_8UC3));
    OpenCV.convertScaleAbs(cropped, enhanced, 1.15, 8);

    const outputPath = uriToFilePath(uri).replace(/\.jpe?g$/i, '_scan.jpg');
    enhanced.saveToFile(outputPath);
    releaseAll();

    return {uri: `file://${outputPath}`, borderDetected: true};
  } catch {
    releaseAll();
    return {uri, borderDetected: false};
  }
}
