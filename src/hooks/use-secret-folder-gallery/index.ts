import { useAnalytics } from '@kirz/expo-toolkit';
import * as FileSystem from 'expo-file-system';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { ActionSheetIOS, Alert } from 'react-native';

import { CameraRoll, type GalleryAsset } from '@/modules/cleaner-gallery';

import { useGalleryPicker } from '../use-gallery-picker';
import { assetsAtom, assetsStore, type SecretFolderAsset } from './atom';

type UseSecretFolderGalleryOptions = {
  sort?: 'ASC' | 'DESC';
  removeAfterImportPrompt?: () => Promise<boolean>;
  restoreAfterDeletePrompt?: () => Promise<boolean>;
};
export function useSecretFolderGallery({
  sort = 'DESC',
  removeAfterImportPrompt = defaultRemoveAfterImportPrompt,
  restoreAfterDeletePrompt = defaultRestoreAfterDeletePrompt,
}: UseSecretFolderGalleryOptions = {}) {
  const { openGalleryPicker, openCameraPicker } = useGalleryPicker();
  const { logEvent } = useAnalytics();
  const [assets, setAssets] = useAtom(assetsAtom, {
    store: assetsStore,
  });

  const assetsReversed = assets.toReversed();

  const showActionSheet = useCallback(async () => {
    const promise = await new Promise((res) => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take photo', 'Import photos or videos'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            res('cancel');
          } else if (buttonIndex === 2) {
            res('gallery');
          } else if (buttonIndex === 1) {
            res('camera');
          }
        }
      );
    });
    return promise;
  }, []);

  const addAssets = useCallback(
    async (limit?: number) => {
      const selectedOption = await showActionSheet();

      if (selectedOption === 'cancel') {
        return;
      }

      const pickedAssets = await (
        selectedOption === 'camera' ? openCameraPicker : openGalleryPicker
      )();

      if (!pickedAssets.length) {
        return;
      }

      const allowedPhotos: (GalleryAsset & { tempUri: string })[] = (
        await Promise.all(pickedAssets.filter((x) => x.id))
      ).slice(0, limit);

      const storedAssets = await Promise.all(
        allowedPhotos.map(async ({ tempUri, ...item }) => {
          const filename = `${item.id.replace(/\//g, '-')}-${Date.now().valueOf()}`;

          const newImagePath = `${FileSystem.documentDirectory}/${filename}_${tempUri
            .slice(-5)
            .replace(/:/g, '-')}`;

          const newImageThumbnailPath =
            selectedOption === 'gallery'
              ? `${FileSystem.documentDirectory}${filename}_thumbnail.jpg`
              : undefined;

          try {
            await Promise.all([
              FileSystem.copyAsync({
                from: tempUri,
                to: newImagePath,
              }),
            ]);
            // newImageThumbnailPath &&
            //   (await CameraRoll.extractThumbnail(item.id, newImageThumbnailPath, 200, 200));
          } catch (error) {
            console.error(error);
          }

          const originalUri = newImagePath.replace(
            FileSystem.documentDirectory ?? '',
            ''
          );

          return {
            ...item,
            id: `${item.id}_${Date.now().valueOf()}`,
            uri: (item.mediaType === 'video'
              ? await (async () => {
                  const videoPreviewPath = `${FileSystem.documentDirectory}${filename}_preview.jpg`;

                  await CameraRoll.extractThumbnail(
                    item.id,
                    videoPreviewPath,
                    -1,
                    -1
                  );

                  return videoPreviewPath;
                })()
              : originalUri
            ).replace(FileSystem.documentDirectory ?? '', ''),
            thumbnailUri: (newImageThumbnailPath ?? originalUri).replace(
              FileSystem.documentDirectory ?? '',
              ''
            ),
            originalUri,
          };
        })
      );

      await setAssets(async (prev) => {
        const p = await prev;
        return [...p, ...storedAssets];
      });

      logEvent('secret_gallery_added');
      if (selectedOption === 'gallery') {
        const removeAfterImport = await removeAfterImportPrompt().catch(
          () => false
        );
        if (removeAfterImport) {
          await CameraRoll.deleteAssets(allowedPhotos.map((x) => x.id));
        }
      }
      return storedAssets;
    },
    [
      setAssets,
      openGalleryPicker,
      openCameraPicker,
      showActionSheet,
      logEvent,
      removeAfterImportPrompt,
    ]
  );

  const deleteAssets = useCallback(
    async (ids: string[]) => {
      const assetsToDelete = assets.filter((x) => ids.includes(x.id));

      const restoreFiles = await restoreAfterDeletePrompt();
      if (restoreFiles) {
        await CameraRoll.saveAssets(
          assetsToDelete.map((x) => {
            return `${FileSystem.documentDirectory}${x.originalUri}`;
          })
        );
      }

      // remove files
      await Promise.all([
        ...assetsToDelete.map((x) =>
          FileSystem.deleteAsync(`${FileSystem.documentDirectory}${x.uri}`)
        ),
        ...assetsToDelete
          .filter(
            (x: SecretFolderAsset) => x.thumbnailUri && x.thumbnailUri !== x.uri
          )
          .map((x: SecretFolderAsset) =>
            FileSystem.deleteAsync(
              `${FileSystem.documentDirectory}${x.thumbnailUri}`
            )
          ),
      ]).catch((err) => {
        console.error(err);
      });
      logEvent('secret_gallery_deleted');
      // remove from async storage
      setAssets(assets.filter((x) => !ids.includes(x.id)));
    },
    [setAssets, assets, logEvent, restoreAfterDeletePrompt]
  );

  return {
    assets: sort === 'ASC' ? assets : assetsReversed,
    addAssets,
    deleteAssets,
  };
}

function defaultRemoveAfterImportPrompt() {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      'Remove after import?',
      'Files moved to Secure Folder will be deleted from your photo library.',
      [
        {
          text: 'Later',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => resolve(true),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  });
}

function defaultRestoreAfterDeletePrompt() {
  return new Promise<boolean>((resolve, reject) => {
    Alert.alert(
      'Restore files',
      'Do you want to restore files to your gallery?',
      [
        {
          text: 'Yes',
          style: 'default',
          onPress: () => resolve(true),
        },
        {
          text: 'No',
          style: 'destructive',
          onPress: () => resolve(false),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            reject('user cancelled');
          },
        },
      ],
      { cancelable: true }
    );
  });
}
