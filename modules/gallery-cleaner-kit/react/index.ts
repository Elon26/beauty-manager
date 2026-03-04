import { useSelector } from '@xstate/store/react';
import { deleteAssetsAsync } from 'expo-media-library';
import { useEffect, useMemo } from 'react';
import type {
  CleanerProcess,
  PHAssetDetails,
  PHAssetUri,
  PHSmartAlbumType,
  ProcessState,
} from '../src/GalleryCleanerKit.types';
import GalleryCleanerKitModule from '../src/GalleryCleanerKitModule';
import { taskQueue } from './queue';
import { type StateKey, galleryCleanerStore } from './store';

/**
 * Starts a lookup process for similar or blurry photos (if not already running or done)
 */
export async function startLookup(process: CleanerProcess) {
  if (process === 'similarPhotos') {
    const state = galleryCleanerStore.get().context.state.similarPhotos;
    if (state !== 'idle') {
      return;
    }
    await GalleryCleanerKitModule.getSimilarPhotos();
  } else if (process === 'blurryPhotos') {
    const state = galleryCleanerStore.get().context.state.blurryPhotos; //здесь была ошибка
    if (state !== 'idle') {
      return;
    }
    await GalleryCleanerKitModule.getBlurryImages();
  }
}

/**
 * Reruns lookup for similar and/or blurry photos (if already fetched)
 */
export async function refetchFound() {
  GalleryCleanerKitModule.flushResults();
  const similarPhotosState = galleryCleanerStore.get().context.state.similarPhotos;
  const blurryPhotosState = galleryCleanerStore.get().context.state.blurryPhotos;
  const similar = similarPhotosState !== 'idle' ? GalleryCleanerKitModule.getSimilarPhotos() : null;
  const blurry = blurryPhotosState !== 'idle' ? GalleryCleanerKitModule.getBlurryImages() : null;
  return Promise.all([similar, blurry]);
}

/**
 * Returns a list of IDs for a smart album
 */
export function useSmartAlbum(name: PHSmartAlbumType) {
  const ids = useSelector(galleryCleanerStore, ({ context }) => context.smartAlbums[name]);
  const state = useSelector(galleryCleanerStore, ({ context }) => context.state[name]);

  useEffect(() => {
    if (state === 'idle') {
      galleryCleanerStore.trigger.SET_STATE({ processName: name, state: 'searching' });
      GalleryCleanerKitModule.getSmartAlbum(name).then((res) => {
        galleryCleanerStore.trigger.SET_SMART_ALBUM({ ids: res.ids, albumName: name });
      });
    }
  }, [state, name]);

  return ids;
}

export function useSimilarPhotos() {
  const ids = useSelector(
    galleryCleanerStore,
    ({ context }) => context.duplicatesResult.similarPhotoGroups
  );
  return ids;
}

export function useBlurryPhotos() {
  const ids = useSelector(
    galleryCleanerStore,
    ({ context }) => context.duplicatesResult.blurryImages
  );
  return Object.keys(ids);
}

export function useLookupState(): Record<StateKey, ProcessState>;
export function useLookupState(key: StateKey): ProcessState;
export function useLookupState(key?: StateKey) {
  const state = useSelector(galleryCleanerStore, ({ context }) =>
    key ? context.state[key] : context.state
  );
  return state;
}

/**
 * Returns a PHAssetDetails object for a given asset ID
 */
export function usePHAsset(id: string): PHAssetDetails | undefined {
  const asset = useSelector(galleryCleanerStore, ({ context }) => context.assets[id]);
  useEffect(() => {
    if (!asset) {
      taskQueue.add(async () => {
        const res = await GalleryCleanerKitModule.getAssetsDetails([id]);
        const details = res.pop();
        if (details) {
          galleryCleanerStore.trigger.SET_ASSET_DETAILS({ assetId: id, details });
        }
      });
    }
  }, [id, asset]);
  return asset;
}

/**
 * Returns an array of PHAssetDetails objects for a given array of asset IDs
 */
export function usePHAssetsArray(assetIds: string[]) {
  const assets = useSelector(galleryCleanerStore, ({ context }) => context.assets);
  const details: Record<string, PHAssetDetails | PHAssetUri> = useMemo(() => {
    const result: Record<string, PHAssetDetails | PHAssetUri> = {};
    const missingIds = new Set<string>();
    for (const id of assetIds) {
      if (assets[id]) {
        result[id] = assets[id];
      } else {
        result[id] = {
          id,
          uri: `ph://${id}`,
        };
        missingIds.add(id);
      }
    }
    taskQueue.add(async () => {
      const details = await GalleryCleanerKitModule.getAssetsDetails(Array.from(missingIds));
      if (details) {
        galleryCleanerStore.trigger.SET_ASSET_DETAILS_ARRAY({ details });
      }
    });
    return result;
  }, [assetIds, assets]);

  return details;
}

/**
 * Deletes a PHAsset or an array of PHAssets
 */
export async function deletePHAsset(id: string | string[]) {
  const success = await deleteAssetsAsync(id);
  if (success) {
    galleryCleanerStore.trigger.DELETE_ASSET({ assetId: id });
  }
  return success;
}

export function useMediaLibrary() {
  const mediaLibrary = useSelector(galleryCleanerStore, ({ context }) => context.mediaLibrary);
  const state = useSelector(galleryCleanerStore, ({ context }) => context.state.mediaLibrary);

  useEffect(() => {
    if (state === 'idle') {
      galleryCleanerStore.trigger.SET_STATE({ processName: 'mediaLibrary', state: 'searching' });
      GalleryCleanerKitModule.getAllAssets().then((res) => {
        galleryCleanerStore.trigger.SET_MEDIA_LIBRARY({ ids: res.ids });
      });
    }
  }, [state]);
  return mediaLibrary;
}

export function useAssetsSize(assetIds: string[]) {
  const assets = usePHAssetsArray(assetIds);
  const size = useMemo(() => {
    return Object.values(assets).reduce(
      (acc, asset) => ((asset as PHAssetDetails)?.size ?? 0) + acc, 0
    );
  }, [assets]);
  return size;
}
