import { View } from 'moti';
import { useWindowDimensions } from 'react-native';
import TrashAnimation from '@/animations/delete.json';
import { LottieView } from '@/ui/lottie';

export function CleaningModal() {
  const { width, height } = useWindowDimensions();
  return (
    <View className="justify-center text-center" style={{ width, height }}>
      <View className="flex-1">
        <LottieView
          autoPlay
          className="h-full w-full"
          loop
          source={TrashAnimation}
        />
      </View>
    </View>
  );
}
