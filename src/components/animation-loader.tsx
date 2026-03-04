import LoaderAnimation from '@/animations/loader.json';
import Splash from '@/images/splash.png';
import { LottieView } from '@/ui/lottie';
import { Image } from 'expo-image';
import { View } from 'react-native';

export function AnimationLoader() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Image source={Splash} className="size-[125]" />
      <View className="absolute items-center justify-center inset-x-0 bottom-20">
        <LottieView autoPlay className="h-44 w-56" source={LoaderAnimation} />
      </View>
    </View>
  );
}
