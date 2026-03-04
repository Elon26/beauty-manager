import { HeaderRightWrapper } from '@/components/layout/header-right';
import { colors } from '@/config/theme';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';
import { hexa } from '@/utils/color';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import type {
  NativeStackHeaderLeftProps,
  NativeStackHeaderRightProps,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router } from 'expo-router';
import { type ReactNode, forwardRef, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

type HeaderOptions = {
  headerLeft?: ((props: NativeStackHeaderLeftProps) => ReactNode) | undefined;
  backgroundColor?: string;
};

export function useHeaderOptions() {
  const headerOptions = (
    title?: string,
    options?: HeaderOptions
  ): NativeStackNavigationOptions => {
    const { headerLeft: HeaderLeft, backgroundColor } = options ?? {};
    return {
      title,
      headerShown: true,
      contentStyle: {
        backgroundColor: colors.background.toString(),
      },
      headerTitle: () => (
        <UiText
          className="text-xl font-medium text-center"
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {title}
        </UiText>
      ),
      header: () => (
        <Header
          title={title ?? ''}
          HeaderLeft={HeaderLeft}
          backgroundColor={backgroundColor}
        />
      ),
    };
  };
  return headerOptions;
}

type HeaderProps = {
  backgroundColor?: string;
  title: string;
  HeaderLeft?: (props: NativeStackHeaderLeftProps) => ReactNode;
  HeaderRight?: (props: NativeStackHeaderRightProps) => ReactNode;
  backButtonAction?: () => void;
  adjustsTitleFontSize?: boolean;
};

export function Header({
  title,
  HeaderLeft,
  HeaderRight,
  backgroundColor,
  backButtonAction,
  adjustsTitleFontSize = true,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const leftWidth = useRef(0);
  const rightWidth = useRef(0);
  const [sideWidth, setSideWidth] = useState(0);
  // const [rightWidthComputed, setRightWidthComputed] = useState<number | null>(
  //   null
  // );

  // height: insets.top + scaleY(4) + scaleY(56) <== if you evenr need to account for the height of the header
  return (
    <Animated.View
      className={twMerge(
        'h-14 mx-2.5 px-2.5 rounded-full items-center flex-row gap-4 justify-between z-50'
      )}
      style={{
        marginTop: insets.top + scaleY(4),
        backgroundColor: backgroundColor ?? 'transparent',
      }}
      // entering={FadeInUp}
      pointerEvents="box-none"
    >
      <View
        className="items-start shrink-1"
        onLayout={({ nativeEvent }) => {
          leftWidth.current = nativeEvent.layout.width;
          setSideWidth(Math.max(leftWidth.current, rightWidth.current));
        }}
        style={{ minWidth: sideWidth }}
      >
        {HeaderLeft ? <HeaderLeft /> : <BackButton action={backButtonAction} />}
      </View>
      <UiText
        className="text-lg font-medium text-center grow-0 shrink"
        adjustsFontSizeToFit={adjustsTitleFontSize}
        numberOfLines={1}
      >
        {title}
      </UiText>
      <View
        className="items-end shrink-1"
        onLayout={({ nativeEvent }) => {
          // setRightWidthComputed(nativeEvent.layout.width ? null : 0); // let header take up the remaining space if right is empty
          rightWidth.current = nativeEvent.layout.width;
          setSideWidth(Math.max(leftWidth.current, rightWidth.current));
        }}
        style={{ minWidth: sideWidth }}
      >
        {HeaderRight ? <HeaderRight /> : <HeaderRightWrapper />}
      </View>
    </Animated.View>
  );
}

type BackButtonProps = {
  bg?: string;
  action?: () => void;
};

export const BackButton = forwardRef<View, BackButtonProps>(function BackButton(
  { bg = hexa(colors.gray, 0.3), action = router.back }: BackButtonProps,
  ref
) {
  return (
    <TouchableOpacity
      onPress={() => {
        impactAsync(ImpactFeedbackStyle.Medium);
        action();
      }}
      className="items-center justify-center size-8 rounded-full overflow-hidden"
      ref={ref}
      style={{
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: scaleX(32),
        shadowOpacity: 0.2,
      }}
    >
      <BlurView className="absolute inset-0" tint="light" intensity={60} />
      <SfSymbol
        name="chevron.backward"
        tintColor={colors.text.toString()}
        size={scaleX(16)}
        weight="semibold"
      />
    </TouchableOpacity>
  );
});
