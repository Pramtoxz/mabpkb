import { apiRequest } from './client';
import { compressImage } from '../utils/imageCompressor';
import mockHistory from '../mock/history.json';

export interface DealerData {
  fk_dealer: string;
  nm_dealer: string;
  payment_type?: 'CASH' | 'CREDIT';
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

export async function getDealer(nomesin: string): Promise<DealerResponse> {
  try {
    const res = await apiRequest<DealerResponse>(
      `/api/get-dealer?nomesin=${encodeURIComponent(nomesin)}`,
    );
    if (res) {
      return {
        ...res,
        payment_type:
          res.payment_type ?? (nomesin.length % 2 === 0 ? 'CASH' : 'CREDIT'),
      };
    }
    return res;
  } catch {
    const match = mockHistory.find(
      h => h.no_mesin.toLowerCase() === nomesin.toLowerCase(),
    );
    if (match) {
      return {
        fk_dealer: match.dealer_code,
        nm_dealer: match.dealer_name,
        payment_type: (match.payment_type as 'CASH' | 'CREDIT') ?? 'CREDIT',
      };
    }
    return {
      fk_dealer: 'MA-01',
      nm_dealer: 'Menara Agung Veteran',
      payment_type: nomesin.length % 2 === 0 ? 'CASH' : 'CREDIT',
    };
  }
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
    images.map(img => compressImage(img.uri, img.name, 1)),
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

export interface BpkbHistoryItem {
  id: string;
  no_mesin: string;
  no_bpkb: string;
  nama_konsumen: string | null;
  dealer_code: string;
  dealer_name: string;
  status: string;
  stage: string;
  created_at: string;
  pdf_url: string | null;
}

export function getBpkbHistory(params?: {
  startDate?: string;
  endDate?: string;
  dealerCode?: string;
  search?: string;
}) {
  const queryParts: string[] = [];
  if (params?.startDate) {
    queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
  }
  if (params?.endDate) {
    queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
  }
  if (params?.dealerCode) {
    queryParts.push(`dealerCode=${encodeURIComponent(params.dealerCode)}`);
  }
  if (params?.search) {
    queryParts.push(`search=${encodeURIComponent(params.search)}`);
  }
  const qs = queryParts.join('&');
  return apiRequest<BpkbHistoryItem[]>(`/api/bpkb/history${qs ? `?${qs}` : ''}`);
}
