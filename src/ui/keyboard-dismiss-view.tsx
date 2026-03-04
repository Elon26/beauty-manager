import { type PropsWithChildren, useEffect, useRef } from 'react';
import { Keyboard, View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export type KeyboardDismissViewProps = PropsWithChildren<ViewProps>;

export function KeyboardDismissView(props: KeyboardDismissViewProps) {
  const isKeyboardVisible = useRef(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      isKeyboardVisible.current = true;
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      isKeyboardVisible.current = false;
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View
      {...props}
      className={twMerge(props.className, 'flex-1')}
      onStartShouldSetResponder={() => {
        if (isKeyboardVisible.current) {
          Keyboard.dismiss();
        }

        return false;
      }}
    />
  );
}
