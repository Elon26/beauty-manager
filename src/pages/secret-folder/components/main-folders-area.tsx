import { router } from 'expo-router';
import { View } from 'react-native';

import { useSecretFolderGallery } from '@/hooks/use-secret-folder-gallery';
import { usePrivateContactIds } from '@/modules/contacts-kit/react';
import GalleryIcon from '@/svg/image.svg';
import KeyIcon from '@/svg/key.svg';
import ContactIcon from '@/svg/person.svg';

import { useSecretPasswords } from '../hooks/use-secret-passwords';
import MainFolder from './main-folder';

export default function MainFoldersArea() {
  const { passwords } = useSecretPasswords();
  const { ids } = usePrivateContactIds();
  const { assets } = useSecretFolderGallery();

  return (
    <View className="gap-y-2">
      <MainFolder
        title={t('pages.secret-folder.main.secret-gallery')}
        subtitle={t('pages.secret-folder.main.photos', {
          count: assets.length,
        })}
        Icon={GalleryIcon}
        handlePress={() => router.navigate('/secret-folder/gallery')}
      />
      <MainFolder
        title={t('pages.secret-folder.main.secret-contacts')}
        subtitle={t('pages.secret-folder.main.contacts', { count: ids.length })}
        Icon={ContactIcon}
        handlePress={() => router.navigate('/secret-folder/contacts')}
      />
      <MainFolder
        title={t('pages.secret-folder.main.secret-passwords')}
        subtitle={t('pages.secret-folder.main.passwords', {
          count: passwords?.length || 0,
        })}
        Icon={KeyIcon}
        handlePress={() => router.navigate('/secret-folder/passwords')}
      />
    </View>
  );
}
