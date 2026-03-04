import { View } from 'react-native';

import TrashAnimation from '@/animations/delete.json';
import { LottieView } from '@/ui/lottie';

export function Loader() {
  return (
    <View className="flex-1 items-center justify-center gap-10 pb-20">
      <LottieView
        autoPlay
        className="h-full w-full"
        loop
        source={TrashAnimation}
      />
    </View>
  );
}
