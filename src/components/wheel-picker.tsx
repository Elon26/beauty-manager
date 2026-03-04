import React, { useEffect, useRef } from 'react';
import { FlatList, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { UiText } from '@/ui/ui-text';

type WheelPickerProps = {
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  currentValue: number;
};

type WheelItemProps = {
  item: number;
  index: number;
  itemHeight: number;
  scrollY: Animated.SharedValue<number>;
  topWrap: number;
};

function WheelItem({
  item,
  index,
  itemHeight,
  scrollY,
  topWrap,
}: WheelItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const position = index * itemHeight - scrollY.value;

    const scale = interpolate(
      Math.abs(position / itemHeight),
      [0, 1, 2, 3],
      [1, 0.8, 0.6, 0.4],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(position / itemHeight),
      [0, 1, 2, 3],
      [1, 0.6, 0.4, 0.2],
      Extrapolate.CLAMP
    );

    const rotateX = interpolate(
      position / itemHeight,
      [-3, -2, -1, 0, 1, 2, 3],
      [60, 40, 30, 0, -30, -40, -60],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { rotateX: `${rotateX}deg` }],
      opacity,
      height: itemHeight,
    };
  });

  return (
    <Animated.View
      className="items-center justify-center"
      style={[animatedStyle, { height: itemHeight, top: topWrap }]}
    >
      <UiText className={twMerge('text-xl')}>{item}</UiText>
    </Animated.View>
  );
}

export function WheelPicker({
  min,
  max,
  onValueChange,
  currentValue,
}: WheelPickerProps) {
  const itemHeight = 40;
  const visibleItems = 7;
  const halfVisible = Math.floor(visibleItems / 2);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const data = [
    ...numbers.slice(Math.floor(visibleItems / 2)),
    ...numbers.slice(0, Math.floor(visibleItems / 2)),
  ];

  const loopData = [...data, ...data, ...data];
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    const initialIndex = currentValue - 1 + max;
    const offset = initialIndex * itemHeight - halfVisible * itemHeight;
    flatListRef.current?.scrollToOffset({ offset, animated: false });
    onValueChange(data[0]);
  }, []);

  const onMomentumEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    const realIndex = (index - halfVisible + data.length) % data.length;

    flatListRef.current?.scrollToOffset({
      offset: index * itemHeight,
      animated: false,
    });

    let handledIndex = data[realIndex] + 3;
    if (data[realIndex] > max - Math.floor(visibleItems / 2)) {
      const dif = (max - Math.floor(visibleItems / 2) - data[realIndex]) * -1;
      handledIndex = dif;
    }

    onValueChange(handledIndex);
  };

  return (
    <View
      className="relative overflow-hidden w-40"
      style={{ height: itemHeight * visibleItems }}
    >
      <Animated.FlatList
        ref={flatListRef}
        data={loopData}
        keyExtractor={(_, idx) => idx.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        bounces={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <WheelItem
            item={item}
            index={index}
            itemHeight={itemHeight}
            scrollY={scrollY}
            topWrap={itemHeight * Math.floor(visibleItems / 2)}
          />
        )}
      />

      <View
        className="absolute rounded-lg bg-gray/20 left-0 right-0"
        style={{ top: halfVisible * itemHeight, height: itemHeight }}
        pointerEvents="none"
      />
    </View>
  );
}
