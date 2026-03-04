import AsyncStorage from 'expo-sqlite/kv-store';
import { createStore } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import type { GalleryAsset } from '@/modules/cleaner-gallery';

export type SecretFolderAsset = GalleryAsset & {
  thumbnailUri: string;
  originalUri: string;
};

export const assetsStore = createStore();
const storage = createJSONStorage<SecretFolderAsset[]>(() => AsyncStorage);
export const assetsAtom = atomWithStorage<SecretFolderAsset[]>(
  'secretGalleryStorage',
  [],
  storage
);
