import { cssInterop } from 'nativewind';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeSyntheticEvent } from 'react-native';

import type {
  GalleryContextMenuOption,
  GalleryItem,
  GallerySelection,
  GalleryTapItem,
  GalleryViewMethods,
} from '../src/Gallery.types';
import GalleryView from '../src/GalleryView';
import type { GalleryConfigReact, GalleryProps } from './types';
import { getGroups, getSelectionIndexPaths, separateActions } from './utils';
import { DefaultGalleryViewerModalContent, GalleryViewerModal } from './viewer';

cssInterop(GalleryView, {
  className: { target: 'style' },
});

function GalleryNonMemo({
  data,
  ref: outerRef,
  config,
  style,
  className,
  initialSelection,
  onSelectionChange,
  viewer = DefaultGalleryViewerModalContent,
}: GalleryProps) {
  const innerRef = useRef<GalleryViewMethods>(null);
  const ref = useMemo(() => outerRef || innerRef, [outerRef]);
  const [dataState] = useState(getGroups(data));
  const configRef = useRef(separateActions(config ?? {}));
  const [configState] = useState(configRef.current);
  const hasInitialized = useRef(false);
  const selected = useRef(new Set(initialSelection));

  useEffect(() => {
    if (!hasInitialized.current) {
      return;
    }
    const groups = getGroups(data);
    ref.current?.setData(groups);
    const paths = getSelectionIndexPaths(selected.current, groups);
    ref.current?.setSelection(paths);
  }, [data, ref]);

  useEffect(() => {
    if (!hasInitialized.current) {
      return;
    }
    ref.current?.setConfig(config ?? {});
    configRef.current = separateActions(config ?? {});
  }, [config, ref]);

  const didSelectItem = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<GalleryItem>) => {
      const { id } = nativeEvent;

      selected.current.add(id);
      onSelectionChange?.([...selected.current]);
    },
    [onSelectionChange]
  );

  const didDeselectItem = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<GalleryItem>) => {
      const { id } = nativeEvent;

      selected.current.delete(id);
      onSelectionChange?.([...selected.current]);
    },
    [onSelectionChange]
  );

  const didChangeSelection = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<GallerySelection>) => {
      const { selection } = nativeEvent;

      selected.current = new Set(selection.map((item) => item.id));
      onSelectionChange?.([...selected.current]);
    },
    [onSelectionChange]
  );

  const didClearSelection = useCallback(() => {
    selected.current.clear();
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const didInitialize = useCallback(() => {
    hasInitialized.current = true;
  }, []);

  const didSelectContextMenuOption = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<GalleryContextMenuOption>) => {
      configRef.current.callbacks?.[nativeEvent.action]?.(nativeEvent);
    },
    []
  );

  const viewerRef = useRef<GalleryViewerModal>(null);

  const didTapItem = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<GalleryTapItem>) => {
      viewerRef.current?.present(nativeEvent);
    },
    []
  );

  return (
    <>
      <GalleryView
        className={className}
        config={configState.config}
        data={dataState}
        didChangeSelection={didChangeSelection}
        didClearSelection={didClearSelection}
        didDeselectItem={didDeselectItem}
        didInitialize={didInitialize}
        didSelectContextMenuOption={didSelectContextMenuOption}
        didSelectItem={didSelectItem}
        didTapItem={didTapItem}
        ref={ref}
        style={style}
      />
      <GalleryViewerModal content={viewer} galleryRef={ref} ref={viewerRef} />
    </>
  );
}

export const GalleryMemo = memo(
  GalleryNonMemo
  // (prev, next) =>
  //   prev.config === next.config &&
  //   prev.style === next.style &&
  //   prev.className === next.className &&
  //   prev.onSelectionChange === next.onSelectionChange
);

cssInterop(GalleryMemo, {
  className: { target: 'style' },
});

export const Gallery = GalleryMemo;
export type Gallery = GalleryViewMethods;
export type GalleryConfig = GalleryConfigReact;
