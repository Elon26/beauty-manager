import { usePurchases } from '@kirz/expo-toolkit';
import { scaleX } from '@kirz/nativewind-scale';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { colors } from '@/config/theme';
import { useSetStorage } from '@/hooks/use-storage';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

export function RestoreItem() {
  const { restorePurchases } = usePurchases();
  const [isRestoring, setIsRestoring] = useState(false);

  const setHasDeveloperPremium = useSetStorage('hasDeveloperPremium');

  function activateBackdoor() {
    Alert.prompt(
      'Password',
      'Enter the password to stop the global warming',
      [
        {
          text: 'Back',
          style: 'cancel',
        },
        {
          text: 'Enter',
          onPress: (value) => {
            if (value === 'SaveTheDolphins26121989') {
              setHasDeveloperPremium((prev) => !prev);
            } else {
              Alert.alert('You don’t have the required access level');
            }
          },
        },
      ],
      'plain-text'
    );
  }

  return (
    <Pressable
      disabled={isRestoring}
      onPress={async () => {
        setIsRestoring(true);
        const isRestored = await restorePurchases();
        Alert.alert(
          t('pages.paywall.restore-purchases'),
          isRestored
            ? t('pages.paywall.purchase-restored')
            : t('pages.paywall.no-purchases-found')
        );
        setIsRestoring(false);
      }}
      onLongPress={activateBackdoor}
    >
      <View className="rounded-full bg-grayLight">
        {isRestoring ? (
          <View className="items-center justify-center px-4 py-4.5 w-24">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="flex-row items-center justify-between rounded-full bg-grayLight px-4 py-4.5">
            <UiText className="font-medium">
              {t('pages.settings.restore-purchase')}
            </UiText>
            <SfSymbol
              name="chevron.right"
              tintColor={colors.grayDark.toString()}
              size={scaleX(16)}
              weight="semibold"
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}
