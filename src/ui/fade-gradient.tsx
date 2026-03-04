import { colors } from '@/config/theme';
import { hexa } from '@/utils/color';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';


export function FadeGradient() {
  return (
    <View className="absolute left-0 right-0 bottom-0 h-12 pointer-events-none">
      <LinearGradient
        colors={[hexa(colors.background, 1), hexa(colors.background, 0)]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}
