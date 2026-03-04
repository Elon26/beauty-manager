import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { getAssetInfoAsync } from 'expo-media-library';
import { shareAsync } from 'expo-sharing';
import type { FullscreenViewOverlayComponentProps } from 'expo-simple-gallery';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackIcon from '@/svg/back.svg';
import { Checkbox } from '@/ui/checkbox';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';
import { usePromise } from '@/utils/use-promise';

type FullscreenViewOverlayComponentPropsExtended =
  FullscreenViewOverlayComponentProps & {
    closeViewer?: () => void;
    setSelectionMode?: (selectionMode: boolean) => void;
    deleteByUri?: (uri: string) => Promise<boolean>;
    withButtons?: boolean;
    total?: number;
    bestIndexes?: Set<number>;
  };

export function FullscreenViewOverlayComponent({
  closeViewer,
  selected,
  toggleSelection,
  setSelectionMode,
  uri,
  deleteByUri,
  withButtons = false,
  index,
  total,
  bestIndexes,
}: FullscreenViewOverlayComponentPropsExtended) {
  const handleToggleSelection = () => {
    setSelectionMode?.(true);
    toggleSelection();
  };
  const insets = useSafeAreaInsets();
  const asset = usePromise(getAssetInfoAsync(uri.replace('ph://', '')));
  const isBest = bestIndexes?.has(index);

  return (
    <View style={{ flex: 1 }}>
      <View
        className="absolute z-20 flex-row items-center justify-between bg-white gap-5 inset-x-0 px-4 pb-4"
        style={{
          paddingTop: insets.top,
        }}
      >
        <View className="flex-1">
          <Pressable
            className="items-center justify-center rounded-xl bg-white size-10"
            onPress={() => closeViewer?.()}
          >
            <BackIcon />
          </Pressable>
        </View>
        <UiText className="flex-1 text-center text-xl font-semibold">
          Viewer
        </UiText>
        <View className="flex-1 items-end">
          <Checkbox
            checked={selected}
            onChange={() => {
              handleToggleSelection();
            }}
            isAltView
          />
        </View>
      </View>
      {isBest && (
        <View
          className="absolute items-center justify-center rounded-2xl bg-primary inset-0 h-8 w-11"
          style={{
            top: insets.top + scaleY(60),
            left: insets.left + scaleX(24),
          }}
        >
          <UiText className="text-xs font-medium text-white">Best</UiText>
        </View>
      )}

      {withButtons && (
        <View
          className="absolute flex-row bg-white gap-2.5 px-10 bottom-0 pt-4"
          style={{ paddingBottom: insets.bottom + scaleY(16) }}
        >
          <Pressable
            className="flex-1 items-center justify-center rounded-2xl border-2 border-primary h-12"
            onPress={async () => {
              impactAsync(ImpactFeedbackStyle.Medium);
              if (!asset?.localUri) {
                shareAsync(uri);
                return;
              }
              shareAsync(asset.localUri);
            }}
            style={{
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}
          >
            <UiText>Share</UiText>
          </Pressable>
          <Pressable
            className="flex-1 items-center justify-center rounded-2xl border-2 border-red h-12"
            onPress={async () => {
              impactAsync(ImpactFeedbackStyle.Medium);
              deleteByUri?.(uri);
            }}
            style={{
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}
          >
            <UiText>Delete</UiText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
