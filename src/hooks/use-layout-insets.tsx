import { scaleX } from '@kirz/nativewind-scale';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useLayoutInsets({ withTabs = false } = {}) {
  const headerHeight = useHeaderHeight();
  const safeInsets = useSafeAreaInsets();

  const bottomInset = withTabs
    ? safeInsets.bottom + scaleX(80)
    : safeInsets.bottom;

  return {
    top: headerHeight,
    bottom: bottomInset,
    left: scaleX(16),
    right: scaleX(16),
  };
}
