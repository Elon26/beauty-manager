/** biome-ignore-all lint/suspicious/noExplicitAny: _ */
import type en from './locales/en.json';

type ExtractPluralBase<T> =
  T extends `${infer Base}_${'zero' | 'one' | 'two' | 'few' | 'many' | 'other'}`
    ? Base
    : never;

type IsPluralKey<T> =
  T extends `${string}_${'zero' | 'one' | 'two' | 'few' | 'many' | 'other'}`
    ? true
    : false;

export type DotPaths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? DotPaths<T[K], `${Prefix}${K & string}.`>
    : IsPluralKey<K & string> extends true
      ? never // Exclude suffixed keys from the type
      : `${Prefix}${K & string}`;
}[keyof T];

export type PluralPaths<T, Prefix extends string = ''> =
  | {
      [K in keyof T]: T[K] extends Record<string, any>
        ? PluralPaths<T[K], `${Prefix}${K & string}.`>
        : never;
    }[keyof T]
  | {
      [K in keyof T]: ExtractPluralBase<K & string> extends never
        ? never
        : `${Prefix}${ExtractPluralBase<K & string>}`;
    }[keyof T];

export type AllPaths<T> = DotPaths<T> | PluralPaths<T>;

export type LangKeys = typeof en;
