import { scaleX } from '@kirz/nativewind-scale';
import { router } from 'expo-router';
import { View } from 'react-native';

import { colors } from '@/config/theme';
import AlertIcon from '@/svg/alert.svg';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

export default function MainAware() {
  return (
    <Pressable
      className="flex-row items-center rounded-3xl bg-grayLight gap-x-2 p-4"
      onPress={() => router.navigate('/set-pin')}
    >
      <AlertIcon />
      <View className="flex-1 gap-y-1">
        <UiText className="text-sm font-medium">
          {t('pages.secret-folder.main.secret-folder-not-protected-title')}
        </UiText>
        <UiText className="text-xs text-grayDark">
          {t('pages.secret-folder.main.secret-folder-not-protected-text')}
        </UiText>
      </View>
      <View className="items-center justify-center size-3">
        <SfSymbol
          name="chevron.right"
          size={scaleX(12)}
          weight="medium"
          tintColor={colors.grayDark.toString()}
        />
      </View>
    </Pressable>
  );
}
