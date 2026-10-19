import { apiRequest } from './client';
import { compressImage } from '../utils/imageCompressor';
import mockHistory from '../mock/history.json';
import mockPerformance from '../mock/performance.json';

export interface DealerData {
  fk_dealer: string;
  nm_dealer: string;
  no_mesin?: string;
  bentuk_penjualan?: string;
  akurasi?: string;
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
    const res = await apiRequest<any>(
      `/api/get-dealer?nomesin=${encodeURIComponent(nomesin)}`,
    );
    if (res && res.fk_dealer && res.nm_dealer) {
      const rawBentuk = (res.bentuk_penjualan ?? '').toLowerCase();
      const paymentType: 'CASH' | 'CREDIT' =
        rawBentuk.includes('kredit') || rawBentuk.includes('credit')
          ? 'CREDIT'
          : 'CASH';

      return {
        fk_dealer: res.fk_dealer,
        nm_dealer: res.nm_dealer,
        no_mesin: res.no_mesin ?? nomesin,
        bentuk_penjualan: res.bentuk_penjualan,
        akurasi: res.akurasi,
        payment_type: res.payment_type ?? paymentType,
      };
    }
    return null;
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
  compressed.forEach(img => {
    formData.append('images[]', {
      uri: img.uri,
      type: img.type || 'image/jpeg',
      name: img.name || 'photo.jpg',
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

export interface ActivityTodayResponse {
  count: number;
  target: number;
  date: string;
}

export function getActivityToday() {
  return apiRequest<ActivityTodayResponse>('/api/activity/today');
}

export interface PerformanceSummary {
  totalThisMonth: number;
  targetThisMonth: number;
  achievementPercentage: number;
  avgScanSeconds: number;
  accuracyRate: number;
}

export interface PerformanceWeeklyItem {
  day: string;
  completed: number;
  target: number;
}

export interface PerformanceMonthlyItem {
  month: string;
  total: number;
}

export interface PerformanceResponse {
  summary: PerformanceSummary;
  weekly: PerformanceWeeklyItem[];
  monthly: PerformanceMonthlyItem[];
}

export async function getPerformance(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<PerformanceResponse> {
  const queryParts: string[] = [];
  if (params?.startDate) {
    queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
  }
  if (params?.endDate) {
    queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
  }
  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  try {
    const res = await apiRequest<PerformanceResponse>(`/api/performance${qs}`);
    if (res && res.summary && res.weekly && res.monthly) {
      return res;
    }
  } catch {
  }

  try {
    const act = await getActivity();
    const completed = act.completed_bpkb ?? 0;
    const target = act.target_bpkb || 100;
    const percent = Math.min(Math.round((completed / target) * 100), 100);

    const baseMock = mockPerformance as PerformanceResponse;

    return {
      summary: {
        totalThisMonth: completed,
        targetThisMonth: target,
        achievementPercentage: percent,
        avgScanSeconds: baseMock.summary.avgScanSeconds,
        accuracyRate: baseMock.summary.accuracyRate,
      },
      weekly: baseMock.weekly,
      monthly: baseMock.monthly.map((m, idx) => {
        if (idx === baseMock.monthly.length - 1 && completed > 0) {
          return {...m, total: completed};
        }
        return m;
      }),
    };
  } catch {
    return mockPerformance as PerformanceResponse;
  }
}

export interface MonitoringStats {
  total_all: number;
  total_completed: number;
  total_processing: number;
  total_queued: number;
  total_failed: number;
  total_with_pdf: number;
}

export interface MonitoringPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface MonitoringItem {
  track_id: string;
  no_mesin: string;
  no_bpkb: string;
  nama_konsumen: string | null;
  stage: string;
  status: string;
  error_message: string | null;
  pdf_path: string | null;
  file_saved_on_server: boolean;
  file_size_bytes: number;
  file_size_formatted: string | null;
  file_last_modified?: string | null;
  file_url: string | null;
  download_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonitoringResponse {
  status: boolean;
  stats: MonitoringStats;
  pagination: MonitoringPagination;
  data: MonitoringItem[];
}

export interface MonitoringParams {
  search?: string;
  status?: string;
  stage?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  month?: string;
  has_file?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export function getBpkbMonitoring(params?: MonitoringParams) {
  const queryParts: string[] = [];
  if (params?.search) {
    queryParts.push(`search=${encodeURIComponent(params.search)}`);
  }
  if (params?.status) {
    queryParts.push(`status=${encodeURIComponent(params.status)}`);
  }
  if (params?.stage) {
    queryParts.push(`stage=${encodeURIComponent(params.stage)}`);
  }
  if (params?.date) {
    queryParts.push(`date=${encodeURIComponent(params.date)}`);
  }
  if (params?.start_date) {
    queryParts.push(`start_date=${encodeURIComponent(params.start_date)}`);
  }
  if (params?.end_date) {
    queryParts.push(`end_date=${encodeURIComponent(params.end_date)}`);
  }
  if (params?.month) {
    queryParts.push(`month=${encodeURIComponent(params.month)}`);
  }
  if (params?.has_file !== undefined) {
    queryParts.push(`has_file=${params.has_file ? '1' : '0'}`);
  }
  if (params?.sort_by) {
    queryParts.push(`sort_by=${encodeURIComponent(params.sort_by)}`);
  }
  if (params?.sort_direction) {
    queryParts.push(`sort_direction=${encodeURIComponent(params.sort_direction)}`);
  }
  if (params?.page) {
    queryParts.push(`page=${params.page}`);
  }
  if (params?.per_page) {
    queryParts.push(`per_page=${params.per_page}`);
  }
  const qs = queryParts.join('&');
  return apiRequest<MonitoringResponse>(`/api/bpkb/monitoring${qs ? `?${qs}` : ''}`);
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

export async function getBpkbHistory(params?: {
  startDate?: string;
  endDate?: string;
  dealerCode?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<BpkbHistoryItem[]> {
  try {
    const res = await getBpkbMonitoring({
      search: params?.search,
      start_date: params?.startDate,
      end_date: params?.endDate,
      page: params?.page ?? 1,
      per_page: params?.perPage ?? 50,
    });
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(item => ({
        id: item.track_id,
        no_mesin: item.no_mesin,
        no_bpkb: item.no_bpkb,
        nama_konsumen: item.nama_konsumen,
        dealer_code: (item as any).dealer_code ?? 'MA-01',
        dealer_name: (item as any).dealer_name ?? 'Menara Agung Veteran',
        status: item.status,
        stage: item.stage,
        created_at: item.created_at,
        pdf_url: item.download_url ?? item.file_url ?? item.pdf_path,
      }));
    }
    return mockHistory as BpkbHistoryItem[];
  } catch {
    return mockHistory as BpkbHistoryItem[];
  }
}
