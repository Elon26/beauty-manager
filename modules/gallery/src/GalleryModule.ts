import type { GalleryModuleEvents } from './Gallery.types';
import { NativeModule, requireNativeModule } from 'expo';

declare class GalleryModule extends NativeModule<GalleryModuleEvents> {}

// This call loads the native module object from the JSI.
export default requireNativeModule<GalleryModule>('Gallery');
