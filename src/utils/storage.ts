import RNFS from 'react-native-fs';
import type {ActivityResponse} from '../api/endpoints';
import mockActivity from '../mock/activity.json';

interface AppStorageData {
  tours: Record<string, boolean>;
  activity: ActivityResponse;
}

const STORAGE_PATH = `${RNFS.DocumentDirectoryPath}/aciax_app_storage.json`;

const defaultData: AppStorageData = {
  tours: {},
  activity: mockActivity,
};

let memoryCache: AppStorageData = {
  tours: {},
  activity: mockActivity,
};

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

async function persist(): Promise<void> {
  try {
    await RNFS.writeFile(STORAGE_PATH, JSON.stringify(memoryCache), 'utf8');
  } catch {}
}

export async function initStorage(): Promise<void> {
  if (isLoaded) {
    return;
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const exists = await RNFS.exists(STORAGE_PATH);
      if (exists) {
        const content = await RNFS.readFile(STORAGE_PATH, 'utf8');
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          memoryCache = {
            tours: parsed.tours ?? {},
            activity: parsed.activity ?? mockActivity,
          };
        }
      } else {
        await persist();
      }
    } catch {
      memoryCache = {
        tours: {},
        activity: mockActivity,
      };
    } finally {
      isLoaded = true;
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function hasSeenTour(tourKey: string): boolean {
  return Boolean(memoryCache.tours[tourKey]);
}

export async function markTourSeen(tourKey: string): Promise<void> {
  memoryCache.tours[tourKey] = true;
  await persist();
}

export async function resetTour(tourKey: string): Promise<void> {
  delete memoryCache.tours[tourKey];
  await persist();
}

export function getCachedActivity(): ActivityResponse {
  return memoryCache.activity;
}

export async function saveActivity(activity: ActivityResponse): Promise<void> {
  memoryCache.activity = activity;
  await persist();
}
