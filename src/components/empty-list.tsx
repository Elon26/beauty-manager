import { ReactNode } from 'react';
import { View } from 'react-native';

import { default as Empty } from '@/svg/empty.svg';
import { UiText } from '@/ui/ui-text';

type EmptyListProps = {
  text?: string;
  icon?: boolean;
  children?: ReactNode;
};

export function EmptyList({ text, icon = false, children }: EmptyListProps) {
  return (
    <View
      className={`flex-1 items-center justify-center gap-y-4 ${
        children ? '-top-20' : ''
      }`}
    >
      {icon && <Empty />}
      {children ? (
        children
      ) : text ? (
        <UiText className="text-lg text-grayDark">{text}</UiText>
      ) : null}
    </View>
  );
}
