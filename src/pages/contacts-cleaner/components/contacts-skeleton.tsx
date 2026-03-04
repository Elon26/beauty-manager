import PointIcon from '@/svg/contacts-cleaner/point.svg';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function ShinyCircleSkeleton({ size = scaleX(40) }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#2E90FA', '#7CCBFF', '#2E90FA']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

export function SkeletonLine({
  wClass,
  hClass = 'h-2.5',
}: {
  wClass: string;
  hClass?: string;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.4, { duration: 700 }), -1, true);
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={animStyle}
      className={`${hClass} ${wClass} rounded-full bg-black/10`}
    />
  );
}

function SkeletonGroupCard() {
  return (
    <View className="overflow-hidden rounded-2xl bg-[#F8F8F8]">
      <View className="flex-row items-center gap-3 pl-2 pr-4 mb-2 pt-2">
        <View
          style={{
            width: scaleX(40),
            height: scaleX(40),
            borderRadius: scaleX(40) / 2,
            overflow: 'hidden',
            marginTop: scaleY(8),
            zIndex: 10,
          }}
        >
          <LinearGradient
            colors={['#229DFB', '#BCD9EF', '#229DFB']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>

        <View className="flex-1 gap-1 pt-2">
          <SkeletonLine wClass="w-32" hClass="h-4" />
          <SkeletonLine wClass="w-20" hClass="h-4" />
        </View>
      </View>
      <View className="absolute left-7 bottom-6">
        <PointIcon />
      </View>
      <View className="absolute left-7 top-4">
        <PointIcon />
      </View>
      <View className="pl-15 px-4 py-2">
        <View className="flex-row items-center">
          <View className="flex-1 gap-1 pl-11 py-2">
            <SkeletonLine wClass="w-32" hClass="h-4" />
            <SkeletonLine wClass="w-20" hClass="h-4" />
          </View>
        </View>
      </View>

      <View className="pl-15 px-4 pb-3 py-2">
        <View className="flex-row items-center">
          <View className="flex-1 gap-1 pl-11">
            <SkeletonLine wClass="w-32" hClass="h-4" />
            <SkeletonLine wClass="w-20" hClass="h-4" />
          </View>
        </View>
      </View>
    </View>
  );
}

export function ContactsGroupsSkeleton() {
  const items = [0, 1, 2, 3];

  return (
    <FlatList
      alwaysBounceVertical={false}
      className="flex-1"
      contentContainerClassName="gap-3 min-h-full"
      contentContainerStyle={{
        paddingBottom: scaleY(175),
        paddingTop: scaleY(8),
      }}
      data={items}
      keyExtractor={(i) => String(i)}
      renderItem={() => <SkeletonGroupCard />}
    />
  );
}
