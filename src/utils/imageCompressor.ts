import ImageResizer from '@bam.tech/react-native-image-resizer';

export interface CompressedImage {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export async function compressImage(
  uri: string,
  fileName: string,
  maxSizeMB: number = 4.5,
  maxWidthOrHeight: number = 1920,
): Promise<CompressedImage> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const initial = await ImageResizer.createResizedImage(
    uri,
    maxWidthOrHeight,
    maxWidthOrHeight,
    'JPEG',
    80,
    0,
    undefined,
    false,
    {mode: 'contain', onlyScaleDown: true},
  );

  if (initial.size <= maxSizeBytes) {
    return {uri: initial.uri, type: 'image/jpeg', name: fileName, size: initial.size};
  }

  let minQuality = 30;
  let maxQuality = 80;
  let bestResult = initial;

  for (let i = 0; i < 6; i++) {
    const quality = Math.round((minQuality + maxQuality) / 2);

    const resized = await ImageResizer.createResizedImage(
      uri,
      maxWidthOrHeight,
      maxWidthOrHeight,
      'JPEG',
      quality,
      0,
      undefined,
      false,
      {mode: 'contain', onlyScaleDown: true},
    );

    if (resized.size <= maxSizeBytes) {
      bestResult = resized;
      minQuality = quality;
      if (resized.size >= maxSizeBytes * 0.9) {
        break;
      }
    } else {
      maxQuality = quality;
    }
  }

  return {
    uri: bestResult.uri,
    type: 'image/jpeg',
    name: fileName,
    size: bestResult.size,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
