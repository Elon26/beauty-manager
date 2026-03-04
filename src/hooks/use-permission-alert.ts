import { openSettings } from 'expo-linking';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import type { Permission } from 'react-native-permissions';

import { usePermissions } from './use-permissions';

export function usePermissionAlert(permission: Permission, prompt: string) {
  const { checkPermissionStatus } = usePermissions();

  useEffect(() => {
    (async () => {
      const { status } = await checkPermissionStatus(permission);

      if (status === 'blocked') {
        Alert.alert('Access denied', prompt, [
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
    })();
  }, [checkPermissionStatus, permission, prompt]);
}
