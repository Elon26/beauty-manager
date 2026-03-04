import type { PHAssetDetails } from '../src/GalleryCleanerKit.types';
import AsyncStorage from 'expo-sqlite/kv-store';
import { funnel } from 'remeda';

type CacheItem = PHAssetDetails & {
  updatedAt: string;
};

export class AssetDetailsCache {
  private cacheKey = 'AssetDetailsCache.rev3';
  private data = {} as Record<string, CacheItem>;

  constructor() {
    const json = AsyncStorage.getItemSync(this.cacheKey);
    if (json) {
      try {
        this.data = JSON.parse(json) as Record<string, CacheItem>;
      } catch (error) {
        console.error(`Failed to parse cache data: ${error}`);
        this.data = {};
      }
    }
  }

  private async _save() {
    const json = JSON.stringify(this.data);
    await AsyncStorage.setItemAsync(this.cacheKey, json);
  }

  private saveDebounced = funnel(this._save.bind(this), { minGapMs: 2000, triggerAt: 'both' });

  public set(assetDetails: Record<string, PHAssetDetails>) {
    const now = new Date().toISOString();
    const updatedData: Record<string, CacheItem> = {};
    for (const [id, details] of Object.entries(assetDetails)) {
      updatedData[id] = {
        ...details,
        updatedAt: now,
      } as CacheItem;
    }
    this.data = updatedData;
  }

  public save = this.saveDebounced.call;

  public get() {
    return this.data as Record<string, PHAssetDetails | undefined>;
  }
}
