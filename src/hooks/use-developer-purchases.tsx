import { usePurchases } from '@kirz/expo-toolkit';
import { createContext, ReactNode, useEffect, useState } from 'react';

import { useStorageValue } from './use-storage';

type Props = {
  children: ReactNode;
};

const DeveloperPurchasesContext = createContext<boolean | undefined>(undefined);

export function DeveloperPurchasesProvider({ children }: Props) {
  const value = useHasPremiumWithBackdoor();
  return (
    <DeveloperPurchasesContext.Provider value={value}>
      {children}
    </DeveloperPurchasesContext.Provider>
  );
}

export function useHasPremiumWithBackdoor() {
  const { hasPremium: businessHasPremium } = usePurchases();
  const hasDeveloperPremium = useStorageValue('hasDeveloperPremium');

  const [hasPremium, setHasPremium] = useState(
    hasDeveloperPremium || businessHasPremium
  );

  useEffect(() => {
    setHasPremium(hasDeveloperPremium || businessHasPremium);
  }, [hasDeveloperPremium, businessHasPremium]);

  return hasPremium;
}
