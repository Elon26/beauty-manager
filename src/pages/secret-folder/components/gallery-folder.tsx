import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import * as FileSystem from 'expo-file-system';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { shareAsync } from 'expo-sharing';
import {
  type ExpoSimpleGalleryMethods,
  ExpoSimpleGalleryView,
} from 'expo-simple-gallery';
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyList } from '@/components/empty-list';
import { FullscreenViewOverlayComponent } from '@/components/gallery/fullscreen-overlay';
import { ThumbnailOverlayComponent } from '@/components/gallery/thumbnail-overlay';
import { colors } from '@/config/theme';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { usePaywall } from '@/hooks/use-paywall';
import { useSecretFolderGallery } from '@/hooks/use-secret-folder-gallery';
import { SecretFolderAsset } from '@/hooks/use-secret-folder-gallery/atom';
import { UiButton } from '@/ui/ui-button';
import { UiButtonRed } from '@/ui/ui-button-red';
import { UiText } from '@/ui/ui-text';
import { isNotNullOrUndefined } from '@/utils/array';
import { Deferred } from '@/utils/deferred';

const LIMIT = 3;

type Props = {
  selectedAssets: SecretFolderAsset[];
  setSelected: Dispatch<SetStateAction<SecretFolderAsset[]>>;
  galleryRef: RefObject<ExpoSimpleGalleryMethods | null>;
};

export default function GalleryFolder({
  selectedAssets,
  setSelected,
  galleryRef,
}: Props) {
  const hasPremium = useHasPremiumWithBackdoor();
  const { showPaywall } = usePaywall();
  const insets = useSafeAreaInsets();
  const { logEvent } = useAnalytics();
  const [adding, setAdding] = useState(false);
  const { assets, addAssets, deleteAssets } = useSecretFolderGallery({
    restoreAfterDeletePrompt: async () => {
      const d = new Deferred<boolean>();
      Alert.alert(
        'Are you sure you want to delete?',
        'This action is permanent. Deleted files can’t be restored.',
        [
          {
            text: 'Cancel',
            onPress: () => d.reject(),
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => d.resolve(false),
            style: 'destructive',
          },
        ]
      );
      return await d.promise;
    },
    sort: 'DESC',
  });

  const uris =
    assets
      ?.map(
        ({ uri, originalUri }: SecretFolderAsset) =>
          `${FileSystem.documentDirectory}${originalUri ?? uri}`
      )
      .filter((uri): uri is string => uri !== undefined) ?? [];

  const getAssetByUri = (uri: string) => {
    const relativeUri = uri.split('/').pop();
    return assets.find((a) => a.originalUri?.endsWith(relativeUri ?? ''));
  };

  const deleteByUri = async (uri: string) => {
    const foundAsset = getAssetByUri(uri);
    if (!foundAsset) {
      return false;
    }
    await deleteAssets([foundAsset.id]);
    return true;
  };

  function handleAdd() {
    if (!hasPremium && uris.length >= 3) {
      showPaywall();
      return;
    }
    impactAsync(ImpactFeedbackStyle.Medium);
    setAdding(true);
    const limit = hasPremium ? 9999999999 : LIMIT - uris.length;
    addAssets(limit).finally(() => {
      galleryRef.current?.setSelected([]);
      setSelected([]);
      setAdding(false);
    });

    logEvent('tap_add_to_secret_folder');
  }

  return (
    <View className="flex-1">
      {uris.length === 0 && (
        <EmptyList icon>
          <View className="items-center gap-1">
            <UiText className="font-medium text-grayDark">
              {t('pages.secret-folder.passwords.empty-list.title')}
            </UiText>
            <UiText className="font-medium text-grayDark">
              {t('pages.secret-folder.passwords.empty-list.subtitle-media')}
            </UiText>
          </View>
        </EmptyList>
      )}
      {uris.length !== 0 && (
        <View className="flex-1">
          <ExpoSimpleGalleryView
            assets={uris}
            columnsCount={3}
            contentContainerStyle={{
              paddingTop: 16,
              gap: 8,
              paddingBottom: scaleY(100),
              paddingHorizontal: 10,
            }}
            contextMenuOptions={[
              {
                title: 'Open',
                sfSymbol: 'arrowshape.turn.up.right',
                action: ({ index }) => {
                  galleryRef.current?.openImageViewer(index);
                },
              },
              {
                title: 'Share',
                sfSymbol: 'square.and.arrow.up',
                action: async ({ uri }) => {
                  shareAsync(uri);
                },
              },
              {
                title: 'Delete',
                attributes: ['destructive'],
                sfSymbol: 'trash',
                action: async ({ uri }) => {
                  deleteByUri(uri);
                },
              },
            ]}
            fullscreenViewOverlayComponent={(props) => (
              <FullscreenViewOverlayComponent
                {...props}
                closeViewer={galleryRef.current?.closeImageViewer}
                deleteByUri={deleteByUri}
                total={uris.flat().length}
                withButtons
              />
            )}
            fullscreenViewOverlayStyle={{
              backgroundColor: colors.white.toString(),
            }}
            onSelectionChange={({ nativeEvent: { selected } }) => {
              const selectedAssets = selected
                .map((uri) => getAssetByUri(uri))
                .filter(isNotNullOrUndefined);
              setSelected(selectedAssets);
            }}
            ref={galleryRef}
            showMediaTypeIcon={false}
            style={{ flex: 1 }}
            thumbnailLongPressAction="preview"
            thumbnailOverlayComponent={ThumbnailOverlayComponent}
            thumbnailPanAction="select"
            thumbnailPressAction="select"
            thumbnailStyle={{ borderRadius: scaleX(16) }}
          />
        </View>
      )}

      <View
        className="absolute items-center justify-center inset-x-4 bottom-0"
        style={{ paddingBottom: insets.bottom + scaleY(10) }}
      >
        {selectedAssets.length ? (
          <UiButtonRed
            disabled={adding}
            loading={adding}
            onPress={async () => {
              impactAsync(ImpactFeedbackStyle.Medium);
              if (selectedAssets.length === 0) {
                return;
              }
              try {
                setAdding(true);
                const ids = selectedAssets.map((asset) => asset.id);
                await deleteAssets(ids);
              } finally {
                galleryRef.current?.setSelected([]);
                setSelected([]);
                setAdding(false);
              }
            }}
          >
            <UiText className="font-semibold text-white">
              {t('pages.secret-folder.gallery.delete-media', {
                count: selectedAssets.length,
              })}
            </UiText>
          </UiButtonRed>
        ) : (
          <UiButton
            disabled={adding}
            loading={adding}
            onPress={handleAdd}
            className="h-12"
          >
            <UiText className="font-semibold text-white">
              {t('pages.secret-folder.gallery.add-media')}
            </UiText>
          </UiButton>
        )}
      </View>
    </View>
  );
}
