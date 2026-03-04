import { headerLayoutStore } from '@/components/layout/store';
import { useSelector } from '@xstate/store/react';
import { useFocusEffect } from 'expo-router';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';

type HeaderRightProps = PropsWithChildren;

export function HeaderRight({ children }: HeaderRightProps) {
  const prevHeaderRight = useRef(headerLayoutStore.getSnapshot().context.headerRight);
  useFocusEffect(() => {
    headerLayoutStore.send({
      type: 'setHeaderRight',
      headerRight: children,
    });
    return () => {
      headerLayoutStore.send({
        type: 'setHeaderRight',
        headerRight: prevHeaderRight.current,
      });
    };
  });

  return null;
}

export function HeaderRightWrapper() {
  const headerRight = useSelector(headerLayoutStore, (state) => state.context.headerRight);
  const [component, setComponent] = useState(headerRight);
  useEffect(() => {
    if (headerRight) {
      setComponent(headerRight);
    }
  }, [headerRight]);
  return headerRight ? (
    <Animated.View
      className="flex-row items-center"
      entering={FadeInRight.duration(150)}
      exiting={FadeOutRight.duration(150)}
    >
      {component}
    </Animated.View>
  ) : null;
}
