import { UiText } from '@/ui/ui-text';
import { View } from 'react-native';

import EmptyPageImage from '@/images/empty-page.png';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';

export default function Empty() {
  return (
    <View className="flex-1 items-center justify-center gap-y-4">
      <Image
        source={EmptyPageImage}
        style={{ width: scaleX(167), height: scaleY(136) }}
        contentFit="contain"
      />
      <UiText className="font-medium text-gray">Nothing here</UiText>
    </View>
  );
}
