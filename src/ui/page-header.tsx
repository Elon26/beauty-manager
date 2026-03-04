import { scaleX } from '@kirz/nativewind-scale';
import { router } from 'expo-router';
import { View } from 'react-native';

import { colors } from '@/config/theme';

import { Pressable } from './pressable';
import { SfSymbol } from './sf-symbol';
import { UiText } from './ui-text';

type Props = {
  pageName: string;
  children?: React.ReactNode;
  goHome?: boolean;
};

export function PageHeader({ pageName, children, goHome }: Props) {
  return (
    <View className="flex-row items-center justify-between py-4">
      <Pressable
        className="flex-row items-center justify-center gap-x-1"
        onPress={() => (goHome ? router.navigate('/main') : router.back())}
      >
        <SfSymbol
          size={scaleX(16)}
          name="chevron.left"
          tintColor={colors.black.toString()}
        />
        <UiText>{t('basic.back')}</UiText>
      </Pressable>
      <UiText className="text-lg font-medium">{pageName}</UiText>
      {children ? children : <View className="size-10" />}
    </View>
  );
}
