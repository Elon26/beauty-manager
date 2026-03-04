import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';

export type GalleryModuleEvents = never;

export type GallerySection = {
  /**
   * UUID
   */
  id: string;
  /**
   * PHAsset IDs
   */
  assets: string[];
};

export type GalleryViewProps = {
  /**
   * An array of groups (sections)
   * Prefer setData method over data prop to update the gallery data with animated updates versus rerendering the component.
   */
  data: GallerySection[];
  /**
   * Configuration options for the gallery.
   */
  config?: GalleryConfig;
  style?: StyleProp<ViewStyle>;
  /**
   * Callback function invoked when an item is selected.
   */
  didSelectItem?: (event: NativeSyntheticEvent<GalleryItem>) => void;
  /**
   * Callback function invoked when an item is deselected.
   */
  didDeselectItem?: (event: NativeSyntheticEvent<GalleryItem>) => void;
  /**
   * Callback function invoked when the selection changes in batch.
   */
  didChangeSelection?: (event: NativeSyntheticEvent<GallerySelection>) => void;
  /**
   * Callback function invoked when the selection is cleared.
   */
  didClearSelection?: (event: NativeSyntheticEvent<never>) => void;
  /**
   * Callback function invoked when an item is tapped.
   */
  didTapItem?: (event: NativeSyntheticEvent<GalleryTapItem>) => void;
  /**
   * Callback function invoked when the gallery is initialized with props. (Will be called after the component is mounted or re-rendered)
   */
  didInitialize?: (event: NativeSyntheticEvent<never>) => void;
  didSelectContextMenuOption?: (event: NativeSyntheticEvent<GalleryContextMenuOption>) => void;

  // ref?: RefObject<GalleryViewMethods | null>;
  className?: string;
};

export type GalleryViewMethods = {
  setSelection: (selection: IndexPath[]) => Promise<void>;
  selectItem: (item: IndexPath) => Promise<void>;
  deselectItem: (item: IndexPath) => Promise<void>;
  selectAll: () => Promise<void>;
  clearSelection: () => Promise<void>;
  /**
   * Merges passed config with the current config (overrides passed values, leaving undefined values unchanged).
   */
  setConfig: (config: Partial<GalleryConfig>) => Promise<void>;
  /**
   * Updates the data of the gallery.
   */
  setData: (data: GallerySection[]) => Promise<void>;
  /**
   * Scrolls to the specified section and index and highlights the item.
   */
  scrollTo: (section: number, index: number) => Promise<void>;
};

export type GalleryConfig = {
  /**
   * The layout type of the gallery. Valid values are
   * * 'flow' - The default layout type.
   * * 'horizontal' - Sectioned, every section is 1-row with horizontal scrolling.
   * * 'mosaic' - Sectioned, every section has large first item and 2-row grid of smaller items.
   * @default 'flow'
   */
  layoutType?: GalleryLayoutType;
  /**
   * The number of columns in the gallery.
   * @default 3
   */
  numberOfColumns?: number;
  /**
   * The gap between items in the gallery (both horizontal and vertical).
   * @default 8
   */
  gap?: number;
  /**
   * Content insets for sections. Preferable to use over `contentInset`
   * @default { top: 0, left: 16, bottom: 0, right: 16 }
   */
  sectionInset?: EdgeInsets;
  /**
   * Content insets for the gallery. For left and right insets prefer `sectionInset`
   * @default { top: 0, left: 0, bottom: 0, right: 0 }
   */
  contentInset?: EdgeInsets;
  /**
   * Aspect ratio for items in the gallery.
   * @default 1.0
   */
  itemAspectRatio?: number;
  /**
   * CornerRadius for items in the gallery.
   * @default 5
   */
  itemCornerRadius?: number;
  /**
   * Whether to toggle selection on tap (or open viewer)
   * @default false
   */
  toggleSelectionOnTap?: boolean;

  /**
   * An identifier of SwiftUI cell view (see ios/Configurable/CellContent)
   */
  cellConfiguration?: string;

  /**
   * An identifier of SwiftUI section header view (see ios/Configurable/SectionHeader)
   */
  sectionHeaderConfiguration?: string;

  /**
   * An identifier of SwiftUI section footer view (see ios/Configurable/SectionFooter)
   */
  sectionFooterConfiguration?: string;

  /**
   * An identifier of SwiftUI section background view (see ios/Configurable/SectionBackground)
   */
  sectionBackgroundConfiguration?: string;
  /**
   * Height of section headers in the gallery.
   * @default 56
   */
  sectionHeaderHeight?: number;
  /**
   * Height of section footers in the gallery.
   * @default 56
   */
  sectionFooterHeight?: number;

  /**
   * An array of context menu actions
   */
  actions?: GalleryContextAction[];
};

/**
 * - flow: classic wrapped-lines layout (sections are separated)
 * - horizontal: main scroll is vertical, sections are scrolled horizontally
 * - mosaic: similar to horizontal but the first thumb in a section is twice as big as the rest
 */
export type GalleryLayoutType = 'flow' | 'horizontal' | 'mosaic';

export type GalleryItem = {
  id: string;
  indexPath: IndexPath;
};

export type IndexPath = {
  section: number;
  item: number;
};

export type GalleryContextMenuOption = {
  id: string;
  indexPath: IndexPath;
  action: string;
};

export type EdgeInsets = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

export type GalleryTapItem = GalleryItem & { section: string[] };
export type GallerySelection = { selection: GalleryItem[] };
type UIMenuElementAttributes = ('disabled' | 'destructive' | 'hidden')[];
type UIMenuElementState = 'on' | 'off' | 'mixed';

export type GalleryContextAction = {
  id: string;
  title: string;
  symbol?: string;
  attributes?: UIMenuElementAttributes;
  state?: UIMenuElementState;
  action?: (e: GalleryContextMenuOption) => void;
};
