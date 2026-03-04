import { View } from 'react-native';

import ShieldIcon from '@/svg/shield.svg';
import { UiText } from '@/ui/ui-text';

export default function MainBanner() {
  return (
    <View className="items-center rounded-3xl bg-grayLight gap-y-2 p-4">
      <View className="items-center justify-center rounded-full bg-green h-7 w-14">
        <ShieldIcon />
      </View>
      <UiText className="text-center text-lg font-medium">
        {t('pages.secret-folder.main.what-is-secret-folder-title')}
      </UiText>
      <UiText className="text-center text-sm text-grayDark">
        {t('pages.secret-folder.main.what-is-secret-folder-text')}
      </UiText>
    </View>
  );
}
