import { colors } from '@/config/theme';
import AppIcon from '@/images/splash.png';
import CheckIcon from '@/svg/check-blue.svg';
import SettingsIcon from '@/svg/ios-settings.svg';
import { ButtonPrimary } from '@/ui/button-primary';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';
import { Env } from '@kirz/expo-env';
import { scaleX } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, View } from 'react-native';

const shadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
} as const;

export function EnableAutofill() {
  const { t } = useTranslation();
  return (
    <Page>
      <PageHeader pageName="Secret Passwords" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center rounded-2xl bg-grayLight gap-4 px-6 py-2.5">
          <SettingsIcon className="size-11" style={shadow} />
          <View className="gap-1">
            <UiText className="text-sm text-grayDark">
              {t('pages.secret-folder.autofill.step', { n: 1 })}
            </UiText>
            <UiText className="text-lg">
              {t('pages.secret-folder.autofill.go-to-settings')}
            </UiText>
          </View>
        </View>

        <View className="rounded-2xl bg-grayLight gap-1 px-6 py-2.5">
          <UiText className="text-sm text-grayDark">
            {t('pages.secret-folder.autofill.step', { n: 2 })}
          </UiText>
          <UiText className="text-lg">
            {t('pages.secret-folder.autofill.tap-passwords-accounts')}
          </UiText>
          <View
            className="flex-row items-center gap-4 pt-2"
            style={{ height: scaleX(44) }}
          >
            <View className="items-center justify-center rounded-lg bg-[#8E8E90] size-7.5">
              <SfSymbol
                name="key.fill"
                size={scaleX(18)}
                tintColor={colors.black.toString()}
              />
            </View>
            <UiText className="text-lg">
              {t('pages.secret-folder.autofill.passwords')}
            </UiText>
          </View>
        </View>

        <View className="rounded-2xl bg-grayLight gap-1 px-6 py-2.5">
          <UiText className="text-sm text-grayDark">
            {t('pages.secret-folder.autofill.step', { n: 3 })}
          </UiText>
          <UiText className="text-lg">
            {t('pages.secret-folder.autofill.tap-password-options')}
          </UiText>
          <View
            className="flex-row items-center"
            style={{ height: scaleX(44) }}
          >
            <UiText className="text-lg">
              {t('pages.secret-folder.autofill.password-options')}
            </UiText>
          </View>
        </View>

        <View className="rounded-2xl bg-grayLight gap-1 px-6 py-2.5">
          <UiText className="text-sm text-grayDark">
            {t('pages.secret-folder.autofill.step', { n: 4 })}
          </UiText>
          <UiText className="text-lg">
            {t('pages.secret-folder.autofill.enable-autofill-passwords')}
          </UiText>
          <View className="flex-row items-center h-11">
            <UiText className="text-lg">
              {t('pages.secret-folder.autofill.autofill-passwords')}
            </UiText>
            <View className="flex-1" />
            <Switch pointerEvents="none" value />
          </View>
        </View>

        <View className="rounded-2xl bg-grayLight gap-1 px-6 py-2.5">
          <UiText className="text-sm text-grayDark">
            {t('pages.secret-folder.autofill.step', { n: 5 })}
          </UiText>
          <UiText className="text-lg">
            {t('pages.secret-folder.autofill.select-app', {
              app: Env.APP_NAME,
            })}
          </UiText>
          <View
            className="flex-row items-center gap-4 mt-2 pt-3 py-2.5"
            style={{ height: scaleX(44) }}
          >
            <Image
              style={{ width: scaleX(30), height: scaleX(30) }}
              className="rounded-lg size-7"
              source={AppIcon}
            />
            <UiText className="text-lg">{Env.APP_NAME}</UiText>
            <View className="flex-1" />
            <CheckIcon />
          </View>
        </View>
        <ButtonPrimary
          className="flex-1 h-12"
          label={t('pages.secret-folder.autofill.button')}
          onPress={() => router.back()}
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
          }}
        />
      </ScrollView>
    </Page>
  );
}
