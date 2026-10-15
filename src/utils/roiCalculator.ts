import {
  DOCUMENT_ASPECT_RATIO,
  DOCUMENT_VIEWPORT_WIDTH_PERCENT,
} from '../constants';

export interface ViewportRoi {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateDocumentRoi(
  imageWidth: number,
  imageHeight: number,
  widthPercent = DOCUMENT_VIEWPORT_WIDTH_PERCENT,
  aspectRatio = DOCUMENT_ASPECT_RATIO,
): ViewportRoi {
  const width = Math.round(imageWidth * widthPercent);
  const height = Math.round(width * aspectRatio);
  const x = Math.max(0, Math.round((imageWidth - width) / 2));
  const y = Math.max(0, Math.round((imageHeight - height) / 2));
  const safeWidth = Math.min(width, imageWidth - x);
  const safeHeight = Math.min(height, imageHeight - y);

  return {
    x,
    y,
    width: safeWidth,
    height: safeHeight,
  };
}
