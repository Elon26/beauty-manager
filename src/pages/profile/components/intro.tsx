import { View } from 'react-native';

import ProfileIcon from '@/svg/profile.svg';
import { UiText } from '@/ui/ui-text';

export default function Intro() {
  return (
    <View className="items-center rounded-2xl bg-grayLight gap-y-2 p-4">
      <View className="items-center justify-center rounded-2xl bg-primary h-7 w-12">
        <ProfileIcon />
      </View>
      <UiText className="text-center text-lg font-medium">
        {t('pages.profile.tell-us')}
      </UiText>
      <UiText className="text-center text-sm text-grayDark">
        {t('pages.profile.personalize')}
      </UiText>
    </View>
  );
}
