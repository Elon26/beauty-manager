import { scaleX } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';

export function Feature({
  title,
  description,
  ImageName,
}: {
  title: string;
  description: string;
  ImageName: string;
}) {
  return (
    <View className="w-[50%] p-1">
      <View className="flex-1 rounded-xl bg-primary gap-y-1 p-3">
        <UiText className="font-semibold text-white">{title}</UiText>
        <UiText className="text-sm text-white">{description}</UiText>
        <View
          style={{
            position: 'absolute',
            top: -scaleX(12),
            right: 0,
          }}
        >
          <Image
            source={ImageName}
            style={{
              width: scaleX(34),
              height: scaleX(34),
            }}
          />
        </View>
      </View>
    </View>
  );
}
