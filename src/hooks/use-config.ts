import { getRemoteConfig, useRemoteConfig } from '@kirz/expo-toolkit';
import { config } from '@/config/config';

export function useConfig() {
  const remoteConfig = useRemoteConfig({
    throwIfModuleNotInitialized: false,
  });

  return {
    ...config,
    ...remoteConfig,
  };
}

export function getonfig() {
  const remoteConfig = getRemoteConfig();

  return {
    ...config,
    ...remoteConfig,
  };
}
