import { scaleX } from '@kirz/nativewind-scale';
import { FC } from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { colors } from '@/config/theme';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

type Props = {
  Icon: FC<SvgProps>;
  title: string;
  subtitle: string;
  quantity: number;
  handler: () => void;
};

export default function SmartCleanerFolder({
  Icon,
  title,
  subtitle,
  quantity,
  handler,
}: Props) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-3xl bg-grayLight gap-x-4 px-4 py-3"
      onPress={handler}
    >
      <View className="flex-row items-center gap-x-4">
        <Icon />
        <View className="gap-y-1">
          <UiText className="font-medium">{title}</UiText>
          <UiText className="text-xs text-grayDark">{subtitle}</UiText>
        </View>
      </View>
      <View className="flex-row items-center gap-x-4">
        <UiText className="font-medium text-grayDark">{quantity}</UiText>
        <SfSymbol
          size={scaleX(16)}
          name="chevron.right"
          tintColor={colors.grayDark.toString()}
        />
      </View>
    </Pressable>
  );
}
