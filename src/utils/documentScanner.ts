import {
  OpenCV,
  Mat,
  Rect,
  Size,
  DataTypes,
  RotateFlags,
} from 'react-native-fast-opencv';
import RNFS from 'react-native-fs';
import {calculateDocumentRoi} from './roiCalculator';

export interface ScanResult {
  uri: string;
  borderDetected: boolean;
}

function uriToFilePath(uri: string): string {
  return uri.replace('file://', '');
}

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
      } catch {}
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

    let workingMat = src;
    if (src.cols > src.rows) {
      const rotated = track(Mat.create(src.cols, src.rows, DataTypes.CV_8UC3));
      OpenCV.rotate(src, rotated, RotateFlags.ROTATE_90_COUNTERCLOCKWISE);
      workingMat = rotated;
    }

    const roi = calculateDocumentRoi(workingMat.cols, workingMat.rows);
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
