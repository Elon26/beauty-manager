import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

import { useHasPremiumWithBackdoor } from './use-developer-purchases';
import { useModals } from './use-modals';

const TOTAL_LIMIT = 3;
const STORAGE_KEY = 'cleaner-limit';

const getLimit = () => {
  if (__DEV__) {
    return TOTAL_LIMIT;
  }
  const storedLimit = SecureStore.getItem(STORAGE_KEY);
  if (storedLimit === null) {
    SecureStore.setItem(STORAGE_KEY, TOTAL_LIMIT.toString());
    return TOTAL_LIMIT;
  }
  return parseInt(storedLimit, 10) ?? TOTAL_LIMIT;
};

export function useCleanerLimit() {
  const hasPremium = useHasPremiumWithBackdoor();
  const { openModal } = useModals();
  const [limit, setLimit] = useState<number>(getLimit());

  const isLimitLeft = () => {
    if (hasPremium) {
      return true;
    }
    return getLimit() > 0;
  };

  const decrementLimit = (by = 1) => {
    if (hasPremium) {
      return by;
    }
    const storedLimit = getLimit();
    const delta = Math.min(storedLimit, by);
    const newLimit = Math.max(0, storedLimit - delta);
    SecureStore.setItem(STORAGE_KEY, newLimit.toString());
    setLimit(newLimit);
    if (by >= storedLimit) {
      openModal('LimitDeletionsModal', { count: TOTAL_LIMIT });
    }
    return delta;
  };

  return {
    limit,
    isLimitLeft,
    decrementLimit,
  };
}
