import { createStore } from '@xstate/store';
import GalleryCleanerKitModule from '../';
import {
  CleanerProcess,
  type DuplicateGroup,
  type DuplicatesResult,
  type PHAssetDetails,
  PHSmartAlbum,
  type PHSmartAlbumType,
  ProcessState,
  type SmartAlbumRecords,
} from '../src/GalleryCleanerKit.types';
import { AssetDetailsCache } from './cache';

const assetsDetailsCache = new AssetDetailsCache();

export type StateKey = CleanerProcess | PHSmartAlbumType | 'mediaLibrary';

const initialContext = {
  duplicatesResult: {
    similarPhotoGroups: [],
    aestheticsScores: [],
    blurScores: [],
    blurryImages: {},
  } as DuplicatesResult,
  assets: assetsDetailsCache.get(),
  mediaLibrary: [] as string[],
  smartAlbums: Object.keys(PHSmartAlbum).reduce((acc, key) => {
    acc[key as PHSmartAlbumType] = [];
    return acc;
  }, {} as SmartAlbumRecords),
  deletedAssets: new Set<string>(),
  state: [...Object.keys(CleanerProcess), ...Object.keys(PHSmartAlbum), 'mediaLibrary'].reduce(
    (acc, key) => {
      acc[key as StateKey] = ProcessState.idle;
      return acc;
    },
    {} as Record<StateKey, ProcessState>
  ),
  progress: Object.keys(CleanerProcess).reduce(
    (acc, key) => {
      acc[key as CleanerProcess] = 0;
      return acc;
    },
    {} as Record<CleanerProcess, number>
  ),
};

export const galleryCleanerStore = createStore({
  context: initialContext,
  on: {
    SET_RESULTS: (context, event: { duplicatesResult: DuplicatesResult }) => {
      return {
        ...context,
        duplicatesResult: filterResult(event.duplicatesResult, context.deletedAssets),
      };
    },
    SET_MEDIA_LIBRARY: (context, event: { ids: string[] }) => {
      const newMediaLibrary = event.ids.filter((assetId) => !context.deletedAssets.has(assetId));
      return {
        ...context,
        mediaLibrary: newMediaLibrary,
        state: {
          ...context.state,
          mediaLibrary: ProcessState.done,
        },
      };
    },
    SET_SMART_ALBUM: (context, event: { ids: string[]; albumName: PHSmartAlbumType }) => {
      const newSmartAlbum = event.ids.filter((assetId) => !context.deletedAssets.has(assetId));
      return {
        ...context,
        smartAlbums: {
          ...context.smartAlbums,
          [event.albumName]: newSmartAlbum,
        },
        state: {
          ...context.state,
          [event.albumName]: ProcessState.done,
        },
      };
    },
    SET_ASSET_DETAILS: (context, event: { assetId: string; details: PHAssetDetails }) => {
      const newAssets = {
        ...context.assets,
        [event.assetId]: event.details,
      };
      return {
        ...context,
        assets: newAssets,
      };
    },
    SET_ASSET_DETAILS_ARRAY: (context, event: { details: PHAssetDetails[] }) => {
      // const newAssets = context.assets;
      const newAssets = { ...context.assets }; // была ошибка, потому что нужно было вернуть новый объект, а не мутировать старый
      for (const asset of event.details) {
        newAssets[asset.id] = asset;
      }
      return {
        ...context,
        assets: newAssets,
      };
    },
    SET_STATE: (
      context,
      event: {
        state: ProcessState;
        processName: StateKey;
      }
    ) => ({
      ...context,
      state: {
        ...context.state,
        [event.processName]: event.state,
      },
    }),
    SET_PROGRESS: (context, event: { progress: number; processName: CleanerProcess }) => ({
      ...context,
      progress: {
        ...context.progress,
        [event.processName]: event.progress,
      },
    }),
    DELETE_ASSET: (context, event: { assetId: string | string[] }) => {
      let newDeletedAssets = new Set([...context.deletedAssets]);
      if (Array.isArray(event.assetId)) {
        newDeletedAssets = new Set([...newDeletedAssets, ...event.assetId]);
      } else {
        newDeletedAssets.add(event.assetId);
      }
      return {
        ...context,
        deletedAssets: newDeletedAssets,
        duplicatesResult: filterResult(context.duplicatesResult, newDeletedAssets),
        mediaLibrary: context.mediaLibrary.filter((assetId) => !newDeletedAssets.has(assetId)),
        smartAlbums: filterSmartAlbums(context.smartAlbums, newDeletedAssets),
      };
    },
  },
});

GalleryCleanerKitModule.addListener('onLookupStarted', ({ processName }) => {
  galleryCleanerStore.trigger.SET_STATE({
    state: ProcessState.searching,
    processName,
  });
});

GalleryCleanerKitModule.addListener('onLookupFinished', ({ processName }) => {
  galleryCleanerStore.trigger.SET_STATE({
    state: ProcessState.done,
    processName,
  });
});

GalleryCleanerKitModule.addListener('onLookupProgressChange', ({ processName, progress }) => {
  galleryCleanerStore.trigger.SET_PROGRESS({
    progress,
    processName,
  });
});

GalleryCleanerKitModule.addListener('onIntermediateResult', (results) => {
  galleryCleanerStore.trigger.SET_RESULTS({
    duplicatesResult: results,
  });
});

function filterResult(result: DuplicatesResult, deleted: Set<string>): DuplicatesResult {
  const filteredGroups: DuplicateGroup[] = [];
  const oldGroups = result.similarPhotoGroups;
  for (const group of oldGroups) {
    const filteredAssets = group.assets.filter((assetId) => !deleted.has(assetId));
    if (filteredAssets.length > 1) {
      filteredGroups.push({ ...group, assets: filteredAssets });
    }
  }
  const filteredBlurry: Record<string, number> = {};
  const oldBlurryKeys = Object.keys(result.blurryImages);
  for (const assetId of oldBlurryKeys) {
    if (!deleted.has(assetId)) {
      filteredBlurry[assetId] = result.blurryImages[assetId];
    }
  }

  return {
    ...result,
    similarPhotoGroups: filteredGroups,
    blurryImages: filteredBlurry,
  };
}

function filterSmartAlbums(
  smartAlbums: SmartAlbumRecords,
  deleted: Set<string>
): SmartAlbumRecords {
  const filteredAlbums = {} as SmartAlbumRecords;
  for (const type of Object.keys(smartAlbums)) {
    filteredAlbums[type as PHSmartAlbumType] = smartAlbums[type as PHSmartAlbumType].filter(
      (id) => !deleted.has(id)
    );
  }
  return filteredAlbums;
}
