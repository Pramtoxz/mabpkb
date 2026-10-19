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
  viewWidth?: number,
  viewHeight?: number,
): ViewportRoi {
  if (viewWidth && viewHeight && viewWidth > 0 && viewHeight > 0) {
    const scale = Math.max(viewWidth / imageWidth, viewHeight / imageHeight);
    const renderedWidth = imageWidth * scale;
    const renderedHeight = imageHeight * scale;
    const cropOffsetScreenX = (renderedWidth - viewWidth) / 2;
    const cropOffsetScreenY = (renderedHeight - viewHeight) / 2;

    const cutoutWidthScreen = viewWidth * widthPercent;
    const cutoutHeightScreen = cutoutWidthScreen * aspectRatio;
    const cutoutLeftScreen = (viewWidth - cutoutWidthScreen) / 2;
    const cutoutTopScreen = (viewHeight - cutoutHeightScreen) / 2;

    const renderedCutoutX = cropOffsetScreenX + cutoutLeftScreen;
    const renderedCutoutY = cropOffsetScreenY + cutoutTopScreen;

    const roiX = Math.round(renderedCutoutX / scale);
    const roiY = Math.round(renderedCutoutY / scale);
    const roiWidth = Math.round(cutoutWidthScreen / scale);
    const roiHeight = Math.round(cutoutHeightScreen / scale);

    const safeX = Math.max(0, Math.min(roiX, imageWidth - 1));
    const safeY = Math.max(0, Math.min(roiY, imageHeight - 1));
    const safeWidth = Math.min(roiWidth, imageWidth - safeX);
    const safeHeight = Math.min(roiHeight, imageHeight - safeY);

    return {
      x: safeX,
      y: safeY,
      width: safeWidth,
      height: safeHeight,
    };
  }

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
