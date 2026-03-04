import { useEffect, useState } from 'react';

export function usePromise<T>(promise: Promise<T>) {
  const [t, setT] = useState<T | undefined>(undefined);

  useEffect(() => {
    promise.then(setT);
  }, [promise]);

  return t;
}
