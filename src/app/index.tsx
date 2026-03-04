import { useAnalytics } from '@kirz/expo-toolkit';
import type { CommonActions, NavigationRoute } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { SplashAnimation } from '@/components/splash-animation';
import { useStorageValue } from '@/hooks/use-storage';

type ResetState = Parameters<(typeof CommonActions)['reset']>['0'];

type ResetExpected = Readonly<{
  key: string;
  index: number;
  routeNames: never[];
  history?: unknown[] | undefined;
  routes: NavigationRoute<never, never>[];
  type: string;
  stale: false;
}>;

export default function Index() {
  const isOnboardingFinished = useStorageValue('isOnboardingFinished');
  const navigation = useNavigation();
  const { logEvent } = useAnalytics();

  const initialNavigationState = useMemo<ResetState>(() => {
    logEvent('af_app_launch');

    if (!isOnboardingFinished) {
      logEvent('af_1st_launch');
      return { routes: [{ name: 'onboarding' }] };
    }

    return { routes: [{ name: 'main' }] };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        navigation.reset(initialNavigationState as ResetExpected);
      }, 3000);
    }, [navigation, initialNavigationState])
  );

  return <SplashAnimation />;
}
