import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';

import SmartCleanerBanner from './components/smart-cleaner-banner';
import SmartCleanerFolders from './components/smart-cleaner-folders';

export function SmartCleanerPage() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const permissionAlertShown = useRef(false);

  useEffect(() => {
    if (!permissionResponse) {
      void requestPermission();
      return;
    }

    if (permissionResponse.status === 'granted') {
      return;
    }

    if (permissionResponse.canAskAgain) {
      void requestPermission();
      return;
    }

    if (!permissionAlertShown.current) {
      permissionAlertShown.current = true;

      Alert.alert(
        'Allow access to photos',
        'Please allow access to your photo library to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  }, [permissionResponse, requestPermission]);
  return (
    <Page>
      <PageHeader pageName="Smart Cleaner" />
      <View className="gap-y-6">
        <SmartCleanerBanner />
        <SmartCleanerFolders />
      </View>
    </Page>
  );
}
