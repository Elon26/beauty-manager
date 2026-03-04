import { scaleY } from '@kirz/nativewind-scale';
import type { ImageProps } from 'expo-image';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useWindowDimensions, View, type ViewStyle } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { UiText } from '@/ui/ui-text';

export type SlideLayoutProps = {
  SlideImage: string;
  title: ReactNode | string;
  description?: string;
  className?: string;
  imageProps?: ImageProps;
  imageContainerStyle?: ViewStyle;
};

export function SlideLayout({
  SlideImage,
  title,
  description,
  className,
  imageContainerStyle,
  imageProps,
}: SlideLayoutProps) {
  const { height: screenHeight } = useWindowDimensions();

  return (
    <View className={twMerge(className, 'flex-1')}>
      {typeof title === 'string' ? (
        <UiText className="text-center text-2xl font-bold color-[#464646]">
          {title}
        </UiText>
      ) : (
        title
      )}
      <View
        style={[
          {
            height: screenHeight / 2.3,
            alignItems: 'center',
            marginTop: scaleY(10),
          },
          imageContainerStyle,
        ]}
      >
        <Image
          {...imageProps}
          source={SlideImage}
          className={twMerge('mt-4', imageProps?.className)}
          style={[{ width: '100%', height: '100%' }, imageProps?.style]}
          contentFit="contain"
        />
      </View>
      {!!description && (
        <View className="h-[120] px-edge mt-5">
          <UiText className="text-center text-lg color-[#464646]">
            {description}
          </UiText>
        </View>
      )}
    </View>
  );
}
