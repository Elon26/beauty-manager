import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

type Props = SafeAreaViewProps & { noSafeArea?: boolean; fullWidth?: boolean };

export function Page({
  children,
  className,
  noSafeArea,
  fullWidth,
  ...props
}: Props) {
  return (
    <SafeAreaView
      {...props}
      className={twMerge(
        'flex-1 bg-white',
        fullWidth ? '' : 'px-edge',
        className
      )}
      edges={noSafeArea ? ['top'] : ['top', 'bottom']}
    >
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
