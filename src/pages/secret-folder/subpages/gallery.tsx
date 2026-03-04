import * as FileSystem from 'expo-file-system';
import type { ExpoSimpleGalleryMethods } from 'expo-simple-gallery';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useSecretFolderGallery } from '@/hooks/use-secret-folder-gallery';
import { SecretFolderAsset } from '@/hooks/use-secret-folder-gallery/atom';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

import GalleryFolder from '../components/gallery-folder';

export function SecretGalleryPage() {
  const { assets } = useSecretFolderGallery();
  const [selectedAssets, setSelected] = useState<SecretFolderAsset[]>([]);

  const galleryRef = useRef<ExpoSimpleGalleryMethods>(null);

  const uris =
    assets
      ?.map(
        ({ uri, originalUri }: SecretFolderAsset) =>
          `${FileSystem.documentDirectory}${originalUri ?? uri}`
      )
      .filter((uri): uri is string => uri !== undefined) ?? [];

  const [isAllAssetsSelected, setIsAllAssetsSelected] = useState(
    selectedAssets.length > 0 && selectedAssets.length === uris.length
  );

  useEffect(() => {
    setIsAllAssetsSelected(
      selectedAssets.length > 0 && selectedAssets.length === uris.length
    );
  }, [selectedAssets, uris]);

  return (
    <Page>
      <PageHeader pageName={t('pages.secret-folder.main.secret-gallery')}>
        {assets.length === 0 ? (
          <View className="size-10" />
        ) : (
          <Pressable
            className="items-end justify-center size-10"
            onPress={() => {
              if (isAllAssetsSelected) {
                galleryRef.current?.setSelected([]);
              } else {
                galleryRef.current?.setSelected(uris);
              }
            }}
          >
            <UiText
              className={twMerge(
                'text-sm font-medium -ml-12',
                isAllAssetsSelected ? 'text-red' : 'text-primary'
              )}
            >
              {isAllAssetsSelected ? 'Deselect all' : 'Select all'}
            </UiText>
          </Pressable>
        )}
      </PageHeader>

      <View className="flex-1">
        <GalleryFolder
          galleryRef={galleryRef}
          selectedAssets={selectedAssets}
          setSelected={setSelected}
        />
      </View>
    </Page>
  );
}
