import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { FC } from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import FolderImage from '@/images/folder.png';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

type Props = {
  title: string;
  subtitle: string;
  Icon: FC<SvgProps>;
  handlePress: () => void;
};

export default function MainFolder({
  title,
  subtitle,
  Icon,
  handlePress,
}: Props) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-3xl bg-grayLight p-5"
      onPress={handlePress}
    >
      <View className="gap-y-2">
        <UiText className="text-xl">{title}</UiText>
        <View className="flex-row items-center gap-x-2">
          <Icon />
          <UiText className="text-sm text-gray">{subtitle}</UiText>
        </View>
      </View>
      <View>
        <Image
          source={FolderImage}
          style={{ width: scaleX(95), height: scaleY(69) }}
        />
      </View>
    </Pressable>
  );
}
