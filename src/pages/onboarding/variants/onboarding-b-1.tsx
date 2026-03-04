import { Env } from '@kirz/expo-env';
import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleY } from '@kirz/nativewind-scale';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Page } from '@/ui/page';
import { UiText } from '@/ui/ui-text';

export function OnboardingB1() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent('af_onbording_v2_step_1');
  }, []);

  return (
    <View>
      <View className="absolute">
        <LinearGradient
          style={{ width, height }}
          colors={['#D9EFFF', '#229DFB']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </View>
      <Page fullWidth>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + scaleY(16) }}
        >
          <View className="items-center">
            <UiText className="text-center text-3xl font-medium text-white mx-edge mb-16">
              {t('pages.onboarding.title-b-1')}
            </UiText>
            <View className="rounded-3xl bg-grayLight gap-y-2 mx-edge p-4 mb-4 h-60">
              <View className="flex-row items-end justify-between rounded-3xl bg-white px-8 pt-2 w-full">
                <View className="gap-y-1 w-20">
                  <UiText className="text-center text-xs">
                    {t('pages.onboarding.without-app-name', {
                      appName: Env.APP_NAME,
                    })}
                  </UiText>
                  <View className="rounded-t-xl bg-red h-16 w-full" />
                </View>
                <View className="gap-y-1 w-20">
                  <UiText className="text-center text-xs">
                    {t('pages.onboarding.with-app-name', {
                      appName: Env.APP_NAME,
                    })}
                  </UiText>
                  <View className="rounded-t-xl bg-green h-32 w-full" />
                </View>
                <View
                  className="absolute rounded-3xl bg-white -right-6 p-2 top-[50%]"
                  style={{ transform: [{ rotate: '5deg' }] }}
                >
                  <UiText className="text-2xl font-bold text-primary">
                    +81%
                  </UiText>
                </View>
              </View>
              <UiText className="text-center text-2xl font-semibold">
                {t('pages.onboarding.more-storage-space')}
              </UiText>
            </View>
            <View className="bg-white mb-16 w-full" style={{ width }}>
              <UiText className="text-center text-4xl font-bold text-primary py-6">
                {t('pages.onboarding.subtitle-b-1')}
              </UiText>
            </View>
            <UiText className="text-center text-xl mx-edge">
              {t('pages.onboarding.text-b-1')}
            </UiText>
          </View>
        </ScrollView>
      </Page>
    </View>
  );
}
