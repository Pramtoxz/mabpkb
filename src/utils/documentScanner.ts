import {
  OpenCV,
  Mat,
  Rect,
  Size,
  DataTypes,
  RotateFlags,
} from 'react-native-fast-opencv';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {calculateDocumentRoi} from './roiCalculator';
import {
  DOCUMENT_ASPECT_RATIO,
  DOCUMENT_VIEWPORT_WIDTH_PERCENT,
  BARCODE_ASPECT_RATIO,
  BARCODE_VIEWPORT_WIDTH_PERCENT,
} from '../constants';

export interface ScanResult {
  uri: string;
  borderDetected: boolean;
}

function uriToFilePath(uri: string): string {
  return uri.replace('file://', '');
}

export async function processScanImage(
  uri: string,
  viewWidth?: number,
  viewHeight?: number,
  isBarcode: boolean = false,
): Promise<ScanResult> {
  const releasables: Array<{release: () => void}> = [];
  const track = <T extends {release: () => void}>(obj: T): T => {
    releasables.push(obj);
    return obj;
  };
  const releaseAll = () => {
    for (const obj of releasables) {
      try {
        obj.release();
      } catch {}
    }
  };

  try {
    const rawPath = uriToFilePath(uri);
    let base64 = '';
    let tempResizedPath: string | null = null;
    try {
      const resized = await ImageResizer.createResizedImage(
        `file://${rawPath}`,
        1920,
        1920,
        'JPEG',
        90,
        0,
      );
      tempResizedPath = resized.path;
      base64 = await RNFS.readFile(resized.path, 'base64');
    } catch {
      base64 = await RNFS.readFile(rawPath, 'base64');
    } finally {
      if (tempResizedPath) {
        try {
          await RNFS.unlink(tempResizedPath);
        } catch {}
      }
    }

    const src = track(Mat.createFromBase64(base64));

    if (src.rows === 0 || src.cols === 0) {
      releaseAll();
      return {uri, borderDetected: false};
    }

    let workingMat = src;
    if (src.cols > src.rows) {
      const rotated = track(Mat.create(src.cols, src.rows, DataTypes.CV_8UC3));
      OpenCV.rotate(src, rotated, RotateFlags.ROTATE_90_CLOCKWISE);
      workingMat = rotated;
    }

    const widthPercent = isBarcode
      ? BARCODE_VIEWPORT_WIDTH_PERCENT
      : DOCUMENT_VIEWPORT_WIDTH_PERCENT;
    const ratio = isBarcode ? BARCODE_ASPECT_RATIO : DOCUMENT_ASPECT_RATIO;

    const roi = calculateDocumentRoi(
      workingMat.cols,
      workingMat.rows,
      widthPercent,
      ratio,
      viewWidth,
      viewHeight,
    );
    const targetRect = track(Rect.create(roi.x, roi.y, roi.width, roi.height));

    const cropped = track(
      Mat.create(roi.height, roi.width, DataTypes.CV_8UC3),
    );
    OpenCV.crop(workingMat, cropped, targetRect);

    const blurred = track(
      Mat.create(roi.height, roi.width, DataTypes.CV_8UC3),
    );
    const blurSize = track(Size.create(5, 5));
    OpenCV.GaussianBlur(cropped, blurred, blurSize, 0);

    const sharpened = track(
      Mat.create(roi.height, roi.width, DataTypes.CV_8UC3),
    );
    OpenCV.addWeighted(cropped, 1.4, blurred, -0.4, 0, sharpened);

    const enhanced = track(
      Mat.create(roi.height, roi.width, DataTypes.CV_8UC3),
    );
    OpenCV.convertScaleAbs(sharpened, enhanced, 1.35, -28);

    const outputPath = uriToFilePath(uri).replace(/\.jpe?g$/i, '_scan.jpg');
    try {
      (enhanced as any).saveToFile(outputPath, 'jpeg', 0.9, 0);
    } catch {
      const outputBase64 = (enhanced as any).toBase64('jpeg');
      await RNFS.writeFile(outputPath, outputBase64, 'base64');
    }

    releaseAll();
    return {uri: `file://${outputPath}`, borderDetected: true};
  } catch (err) {
    console.error(err);
    releaseAll();
    return {uri, borderDetected: false};
  }
}
