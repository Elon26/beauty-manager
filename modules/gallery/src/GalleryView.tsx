import type { GalleryViewMethods, GalleryViewProps } from './Gallery.types';
import { requireNativeView } from 'expo';
import { forwardRef } from 'react';

const NativeView: React.ComponentType<GalleryViewProps> = requireNativeView('Gallery');

export default forwardRef<GalleryViewMethods, GalleryViewProps>(function GalleryView(props, ref) {
  // @ts-expect-error
  return <NativeView {...props} ref={ref} />;
});
