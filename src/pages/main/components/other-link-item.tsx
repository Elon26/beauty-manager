import { scaleX } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { FC } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { colors } from '@/config/theme';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';
import { uuid } from '@/utils/uuid';

type Props = {
  Icon: FC<SvgProps>;
  quantity: number | null;
  title: string;
  handler: () => void;
  AdditionalImage: string | null;
  isLoading?: boolean;
  locked?: boolean;
};

export default function OtherLinkItem({
  Icon,
  quantity,
  title,
  handler,
  AdditionalImage,
  isLoading,
  locked,
}: Props) {
  const arr =
    quantity !== null ? Array(quantity > 5 ? 5 : quantity).fill(0) : [];

  return (
    <View className="w-[50%] p-1">
      <Pressable
        className="rounded-xl bg-grayLight gap-y-2.5 p-4"
        onPress={handler}
      >
        <View className="flex-row items-center justify-between">
          <Icon />

          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <UiText className="text-grayDark">
              {quantity !== null ? quantity : ''}
              {locked ? '- -' : ''}
            </UiText>
          )}
        </View>

        <View className="flex-row items-center justify-between gap-x-1">
          <UiText className="text-sm">{title}</UiText>
          <SfSymbol
            name="chevron.right"
            size={scaleX(12)}
            weight="medium"
            tintColor={colors.grayDark.toString()}
          />
        </View>
        {AdditionalImage && quantity !== 0 && (
          <View className="flex-row mx-1 h-8">
            {arr.map(() => (
              <View className="-mx-1" key={uuid()}>
                <Image
                  source={AdditionalImage}
                  style={{ width: scaleX(32), height: scaleX(32) }}
                />
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </View>
  );
}
