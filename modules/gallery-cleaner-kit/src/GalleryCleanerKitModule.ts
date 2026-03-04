import type {
  DuplicatesResult,
  GalleryCleanerKitModuleEvents,
  PHAssetDetails,
  PHSmartAlbumType,
} from './GalleryCleanerKit.types';
import { NativeModule, requireNativeModule } from 'expo';

declare class GalleryCleanerKitModule extends NativeModule<GalleryCleanerKitModuleEvents> {
  getAllAssets(): Promise<{ ids: string[] }>;
  getAssetsDetails(ids: string[]): Promise<PHAssetDetails[]>;
  getSmartAlbum(name: PHSmartAlbumType): Promise<{ ids: string[] }>;
  getSimilarPhotos(): Promise<DuplicatesResult>;
  getBlurryImages(): Promise<boolean>;
  flushResults(): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<GalleryCleanerKitModule>('GalleryCleanerKit');
