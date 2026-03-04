import { scaleX } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';

type Props = {
  days: number;
  name: string;
  icon: string;
};

export default function AchievementItemOnTheAchievementPage({
  days,
  name,
  icon,
}: Props) {
  return (
    <View className="items-center gap-y-2 w-20">
      <View className="overflow-hidden rounded-3xl size-20">
        <Image
          source={icon}
          style={{ width: scaleX(80), height: scaleX(80) }}
        />
      </View>
      <View className="gap-y-0.5">
        <View className="justify-center h-8">
          <UiText numberOfLines={2} className="text-center text-xs font-medium">
            {name}
          </UiText>
        </View>
        <UiText className="text-center text-xs text-grayDark">
          {t('pages.achievements.days-is-a-row', { count: days })}
        </UiText>
      </View>
    </View>
  );
}
