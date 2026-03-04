import { router, useFocusEffect } from 'expo-router';
import { usePinSettings } from 'expo-with-pincode';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useModals } from '@/hooks/use-modals';
import { useStorage } from '@/hooks/use-storage';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';

import MainAware from './components/main-aware';
import MainBanner from './components/main-banner';
import MainFoldersArea from './components/main-folders-area';

export function SecretFolderPage() {
  const insets = useSafeAreaInsets();
  const [
    isProtectSecretFolderModalNeedToShow,
    setIsProtectSecretFolderModalNeedToShow,
  ] = useStorage('isProtectSecretFolderModalNeedToShow');
  const { openModal, closeModal } = useModals();
  const { isPincodeSet } = usePinSettings();

  useFocusEffect(
    useCallback(() => {
      if (!isPincodeSet && isProtectSecretFolderModalNeedToShow) {
        setIsProtectSecretFolderModalNeedToShow(false);
        openModal('ProtectSecretFolderModal', {
          handleAdd: () => {
            router.navigate('/set-pin');
            closeModal('ProtectSecretFolderModal');
          },
          close: () => {
            closeModal('ProtectSecretFolderModal');
          },
        });
      }
    }, [isPincodeSet, isProtectSecretFolderModalNeedToShow])
  );

  return (
    <Page>
      <PageHeader pageName={t('pages.secret-folder.main.page-name')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View className="gap-y-4">
          <MainBanner />
          <MainFoldersArea />
          {!isPincodeSet && <MainAware />}
        </View>
      </ScrollView>
    </Page>
  );
}
