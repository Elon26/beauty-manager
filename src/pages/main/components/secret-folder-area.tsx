import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, useWindowDimensions, View } from 'react-native';

import SecretFolderMainImage from '@/images/secret-folder-main.png';
import { UiText } from '@/ui/ui-text';

export default function SecretFolderArea() {
  const { width } = useWindowDimensions();

  return (
    <Pressable
      onPress={() => {
        router.navigate('/secret-folder');
      }}
    >
      <Image
        source={SecretFolderMainImage}
        style={{ width: width - scaleX(36), height: scaleY(136) }}
      />
      <View
        className="absolute"
        style={{ left: scaleX(68), bottom: scaleY(20) }}
      >
        <UiText className="text-sm text-white">
          {t('pages.main.secret-folder')}
        </UiText>
        <UiText className="text-sm text-white/50">
          {t('pages.main.make-your-data')}
        </UiText>
      </View>
    </Pressable>
  );
}
