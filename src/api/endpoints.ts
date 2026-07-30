import { apiRequest } from './client';
import { compressImage } from '../utils/imageCompressor';

export interface DealerData {
  fk_dealer: string;
  nm_dealer: string;
}

export type DealerResponse = DealerData | null;

export interface BpkbProcessResponse {
  message: string;
  track_id: string;
}

export interface BpkbTrackResponse {
  id: string;
  no_mesin: string;
  no_bpkb: string;
  nama_konsumen: string | null;
  pdf_path: string | null;
  image_paths: string[] | null;
  stage: string;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export function getDealer(nomesin: string) {
  return apiRequest<DealerResponse>(
    `/api/get-dealer?nomesin=${encodeURIComponent(nomesin)}`,
  );
}

export interface BpkbImage {
  uri: string;
  type: string;
  name: string;
}

export async function processBpkb(
  nomesin: string,
  nobpkb: string,
  images: BpkbImage[],
) {
  const compressed = await Promise.all(
    images.map(img => compressImage(img.uri, img.name)),
  );

  const formData = new FormData();
  formData.append('nomesin', nomesin);
  formData.append('nobpkb', nobpkb);
  compressed.forEach((img, index) => {
    formData.append(`images[${index + 1}]`, {
      uri: img.uri,
      type: img.type,
      name: img.name,
    } as any);
  });

  return apiRequest<BpkbProcessResponse>('/api/bpkb/process', {
    method: 'POST',
    body: formData,
    isMultipart: true,
  });
}

export function trackBpkb(trackId: string) {
  return apiRequest<BpkbTrackResponse>(`/api/bpkb/track/${trackId}`);
}

export interface ActivityResponse {
  target_bpkb: number;
  completed_bpkb: number;
  pending_bpkb: number;
}

export function getActivity() {
  return apiRequest<ActivityResponse>('/api/activity');
}
