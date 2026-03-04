import type { StyleProp, ViewStyle } from 'react-native';
import type { GalleryConfig, GallerySection, GalleryViewMethods } from '../src/Gallery.types';
import type { GalleryViewerModalContent } from './viewer';

export type GalleryConfigReact = GalleryConfig;

export type GalleryProps = {
  /**
   * An array of asset IDs or an array of sections. You can mutate this array to update the gallery data with animated updates.
   * When using sections pay attention to their ids (UUIDs). They should be preserved to animate updates correctly.
   */
  data: string[] | GallerySection[];
  ref?: React.RefObject<GalleryViewMethods | null>;
  config?: GalleryConfig;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /**
   * Initially selected items (array of IDs). Do not mutate this array. Use Gallery ref methods to modify selection.
   */
  initialSelection?: string[];
  /**
   * Callback function that is called when the selection changes.
   * @param selected - Array of selected item IDs.
   */
  onSelectionChange?: (selected: string[]) => void;
  /**
   * Viewer component. Will be shown inside a modal
   */
  viewer?: GalleryViewerModalContent;
};
