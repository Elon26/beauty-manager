import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AppState, View } from 'react-native';

import { useContactsSimilarByField } from '@/modules/contacts-kit/react';
import {
  startLookup,
  useAssetsSize,
  useBlurryPhotos,
  useSimilarPhotos,
  useSmartAlbum,
} from '@/modules/gallery-cleaner-kit/react';
import BlurryPhotosIcon from '@/svg/blurry.svg';
import DuplicateContactsIcon from '@/svg/duplicate-contacts.svg';
import DuplicatePhotosIcon from '@/svg/duplicate-photos.svg';
import ScreenshotIcon from '@/svg/screenshot.svg';

import SmartCleanerFolder from './smart-cleaner-folder';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1000;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function prettyBytes(bytes: number): string {
  return formatBytes(bytes);
}

export default function SmartCleanerFolders() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [lookupStarted, setLookupStarted] = useState(false);

  const similarGroups = useSimilarPhotos();
  const blurryIds = useBlurryPhotos();
  const screenshots = useSmartAlbum('screenshots');

  const [duplicateQuantity, setDuplicateQuantity] = useState(0);

  const { idGroups: phoneGroups } = useContactsSimilarByField('phone');
  const { idGroups: nameGroups } = useContactsSimilarByField('name');

  const duplicateIds = useMemo(() => {
    const ids: string[] = [];
    similarGroups.forEach((group) => {
      group.assets.forEach((asset: any) => {
        if (typeof asset === 'string') ids.push(asset);
        else if (asset?.id) ids.push(asset.id);
      });
    });
    return ids;
  }, [similarGroups]);
  const duplicateSize = useAssetsSize(duplicateIds);
  const screenshotSize = useAssetsSize(screenshots);
  const blurrySize = useAssetsSize(blurryIds);

  const totalContacts = useMemo(() => {
    const phoneCount = phoneGroups.reduce((acc, g) => acc + g.length, 0);
    const nameCount = nameGroups.reduce((acc, g) => acc + g.length, 0);
    return phoneCount + nameCount;
  }, [phoneGroups, nameGroups]);

  useEffect(() => {
    let newQuantity = 0;
    similarGroups.forEach((item) => {
      newQuantity += item.assets.length;
    });
    setDuplicateQuantity(newQuantity);
  }, [similarGroups]);

  useEffect(() => {
    if (!permissionResponse) return;

    if (permissionResponse.status !== 'granted') {
      void requestPermission();
    } else {
      startAllLookups();
      void loadAlbums();
    }
  }, [permissionResponse]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && permissionResponse?.status === 'granted') {
        startAllLookups();
        void loadAlbums();
      }
    });

    return () => sub.remove();
  }, [permissionResponse]);

  const startAllLookups = () => {
    if (lookupStarted) return;

    startLookup('similarPhotos');
    startLookup('blurryPhotos');
    setLookupStarted(true);
  };

  async function loadAlbums() {
    const fetchAll = async (albumName: string) => {
      let allAssets: MediaLibrary.Asset[] = [];
      let after: string | undefined = undefined;

      while (true) {
        const result = await MediaLibrary.getAssetsAsync({
          album: albumName,
          sortBy: [MediaLibrary.SortBy.creationTime],
          first: 1000,
          after,
        });

        allAssets = allAssets.concat(result.assets);

        if (!result.hasNextPage) break;
        after = result.endCursor;
      }

      return allAssets.map((a) => a.id);
    };

    await Promise.all([
      fetchAll('Selfies'),
      fetchAll('Live Photos'),
      fetchAll('Screenshots'),
    ]);
  }

  return (
    <View className="gap-y-2">
      <SmartCleanerFolder
        Icon={DuplicatePhotosIcon}
        title={t('pages.smart-cleaner.duplicate-photos')}
        subtitle={`(${formatBytes(duplicateSize)})`}
        quantity={duplicateQuantity}
        handler={() =>
          router.navigate({
            pathname: '/gallery-cleaner',
            params: { tab: 'similarPhotos' },
          })
        }
      />
      <SmartCleanerFolder
        Icon={ScreenshotIcon}
        title={t('pages.smart-cleaner.screenshots')}
        subtitle={`(${formatBytes(screenshotSize)})`}
        quantity={screenshots.length}
        handler={() =>
          router.navigate({
            pathname: '/gallery-cleaner',
            params: { tab: 'screenshots' },
          })
        }
      />
      <SmartCleanerFolder
        Icon={BlurryPhotosIcon}
        title={t('pages.smart-cleaner.blurry-photos')}
        subtitle={`(${formatBytes(blurrySize)})`}
        quantity={blurryIds.length}
        handler={() =>
          router.navigate({
            pathname: '/gallery-cleaner',
            params: { tab: 'blurryPhotos' },
          })
        }
      />
      <SmartCleanerFolder
        Icon={DuplicateContactsIcon}
        title={t('pages.smart-cleaner.duplicate-contacts')}
        subtitle={prettyBytes((phoneGroups.length + nameGroups.length) * 1000)}
        quantity={totalContacts}
        handler={() => router.navigate('/contacts-cleaner')}
      />
    </View>
  );
}
