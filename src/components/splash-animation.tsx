import { scaleX } from '@kirz/nativewind-scale';
import { View } from 'react-native';

import SplashLoaderAnimation from '@/animations/splash.json';
import { LottieView } from '@/ui/lottie';

export function SplashAnimation() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="absolute items-center justify-center">
        <LottieView
          autoPlay
          style={{ width: scaleX(400), height: scaleX(400) }}
          source={SplashLoaderAnimation}
        />
      </View>
    </View>
  );
}
