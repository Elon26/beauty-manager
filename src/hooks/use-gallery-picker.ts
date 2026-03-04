import * as ImagePicker from 'expo-image-picker';
import { openSettings } from 'expo-linking';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { usePermissions } from '@/hooks/use-permissions';
import type { GalleryAsset } from '@/modules/cleaner-gallery';
import { uuid } from '@/utils/uuid';

export function useGalleryPicker() {
  const { checkPermissionStatus } = usePermissions();

  const openPicker = useCallback(
    async (type: 'camera' | 'library', options?: ImagePicker.ImagePickerOptions) => {
      if (type === 'library') {
        const { status } = await checkPermissionStatus('ios.permission.PHOTO_LIBRARY');

        if (status === 'blocked') {
          Alert.alert('Access denied', 'Access to Photo Library required to select photos.', [
            {
              text: 'Open Settings',
              onPress: openSettings,
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]);
          return [];
        }
      }
      if (type === 'camera') {
        const { status } = await checkPermissionStatus('ios.permission.CAMERA');
        if (status === 'blocked') {
          Alert.alert('Access denied', 'Access to Camera required to take photos.', [
            {
              text: 'Open Settings',
              onPress: openSettings,
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]);
          return [];
        }
      }

      const { assets } = await (type === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync)({
        ...options,
        selectionLimit: 0,
        mediaTypes: type === 'camera' ? undefined : ['videos', 'images', 'livePhotos'],
        allowsMultipleSelection: true,
      });

      if (!assets?.length) {
        return [];
      }

      const galleryAssets: (GalleryAsset & { tempUri: string })[] = [];

      for (const asset of assets) {
        const assetId = asset.assetId ?? uuid();
        const fileName = asset.fileName ?? asset.uri.split('/').pop() ?? uuid();

        if (!asset.fileSize || !asset.uri) {
          continue;
        }
        const galleryAsset: GalleryAsset & { tempUri: string } = {
          id:
            type === 'library'
              ? assetId
              : `${new Date().valueOf()}_${Math.floor(Math.random() * 100000)}`,
          mediaType: asset.type?.includes('video') ? ('video' as const) : ('image' as const),
          size: asset.fileSize,
          name: fileName,
          uri: type === 'library' ? `ph://${asset.assetId}` : asset.uri,
          tempUri: asset.uri,
          duration: asset.duration ?? 0,
        };
        galleryAssets.push(galleryAsset);
      }

      return galleryAssets;
    },
    [checkPermissionStatus]
  );

  const openGalleryPicker = useCallback(
    async (options?: ImagePicker.ImagePickerOptions) => {
      return await openPicker('library', options);
    },
    [openPicker]
  );

  const openCameraPicker = useCallback(
    async (options?: ImagePicker.ImagePickerOptions) => {
      return await openPicker('camera', {
        ...(options ?? {}),
      });
    },
    [openPicker]
  );

  return { openCameraPicker, openGalleryPicker };
}
