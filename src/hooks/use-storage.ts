import {
  atom,
  type PrimitiveAtom,
  useAtom,
  useAtomValue,
  useSetAtom,
} from 'jotai';
import { MMKV } from 'react-native-mmkv';

import { initialStorageState, type Storage } from '@/config/storage';

export const storage = new MMKV();

type StorageAtoms<T extends Record<string, unknown>> = {
  [K in keyof T]: PrimitiveAtom<T[K]>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const createAtom = (key: string, initialValue: any) => {
  const storedValue = storage.getString(key);
  const storageAtom = atom(
    storedValue
      ? (JSON.parse(storedValue) as typeof initialValue)
      : initialValue
  );

  return atom(
    (get) => get(storageAtom),
    (get, set, newValue) => {
      const value =
        typeof newValue === 'function' ? newValue(get(storageAtom)) : newValue;

      storage.set(key, JSON.stringify(value));
      set(storageAtom, value);
    }
  );
};

const atoms = Object.fromEntries(
  Object.entries(initialStorageState).map(([key, initialValue]) => [
    key,
    createAtom(key, initialValue),
  ])
) as StorageAtoms<Storage>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const lazyAtoms: Record<string, PrimitiveAtom<any>> = {};

type StorageKey = keyof typeof atoms;

export const getStorageAtom = <T extends StorageKey>(prop: T) => {
  if (!atoms[prop]) {
    throw new Error(`Unknown storage key: ${prop}`);
  }

  return atoms[prop] as StorageAtoms<Storage>[T];
};

export const useStorageAtom = <T extends StorageKey>(prop: T) => {
  return getStorageAtom(prop);
};

export const useStorageValue = <T extends StorageKey>(prop: T) => {
  return useAtomValue(getStorageAtom(prop));
};

export const useSetStorage = <T extends StorageKey>(prop: T) => {
  return useSetAtom(getStorageAtom(prop));
};

export const useStorage = <T extends StorageKey>(prop: T) => {
  return useAtom(getStorageAtom(prop));
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getLazyStorageAtom = <T>(prop: string, initialValue: any) => {
  if (!lazyAtoms[prop]) {
    lazyAtoms[prop] = createAtom(prop, initialValue);
  }

  return lazyAtoms[prop] as PrimitiveAtom<T>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useLazyStorageAtom = <T>(prop: string, initialValue: any) => {
  return getLazyStorageAtom<T>(prop, initialValue);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useLazyStorageValue = <T>(prop: string, initialValue: any) => {
  return useAtomValue(getLazyStorageAtom<T>(prop, initialValue));
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useLazySetStorage = <T>(prop: string, initialValue: any) => {
  return useSetAtom(getLazyStorageAtom<T>(prop, initialValue));
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useLazyStorage = <T>(prop: string, initialValue: any) => {
  return useAtom(getLazyStorageAtom<T>(prop, initialValue));
};
