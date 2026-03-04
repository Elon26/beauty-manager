import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import prettyBytes from 'pretty-bytes';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json' with { type: 'json' };
import type { DotPaths, LangKeys, PluralPaths } from './types';

export const currentLanguage = getLocales()?.[0]?.languageCode ?? 'en';

i18n
  .use({
    type: 'postProcessor',
    name: 'mark',
    process: (value: string) => `✅${value}`,
  })
  .use(initReactI18next)
  .init({
    lng: currentLanguage,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
    },
    // postProcess: __DEV__ ? ['mark'] : undefined,
    interpolation: {
      escapeValue: false,
      format: (value, format, language) => {
        const languageTag =
          availableLanguages[
            (language as keyof typeof availableLanguages) ?? 'en'
          ]?.localeIdentifier ?? 'en-US';
        if (format === 'number' && typeof value === 'number') {
          return new Intl.NumberFormat(languageTag).format(value);
        }
        if (format === 'size' && typeof value === 'number') {
          return prettyBytes(value, { space: false });
        }
        return value;
      },
    },
  })
  .catch((error) => {
    console.error('Error initializing i18n:', error);
  });

// biome-ignore lint/suspicious/noExplicitAny: _
(global as any).t = i18n.t.bind(i18n);

declare global {
  function t<Key extends DotPaths<LangKeys> | PluralPaths<LangKeys>>(
    key: Key,
    options?: Record<string, unknown>
  ): string;
}

export { i18n };
export type I18nKey = DotPaths<LangKeys>;
export default i18n;

export const availableLanguages = {
  en: {
    name: 'English',
    nativeName: 'English',
    localeIdentifier: 'en-US',
  },
} as const;
