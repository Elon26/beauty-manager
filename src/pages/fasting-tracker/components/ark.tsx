import { View } from 'react-native';

export default function Ark() {
  return (
    <View className="size-32">
      <View className="absolute rounded-full bg-primary size-32" />
      <View className="absolute rounded-full bg-white left-4 top-4 size-24" />
    </View>
  );
}
