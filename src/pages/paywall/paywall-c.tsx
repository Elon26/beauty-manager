import { Env } from '@kirz/expo-env';
import {
  type IAPSubscription,
  useAnalytics,
  useLocale,
  usePnlight,
  usePurchases,
} from '@kirz/expo-toolkit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/config/theme';
import { useConfig } from '@/hooks/use-config';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { usePaywall } from '@/hooks/use-paywall';
import { useWebViewModal } from '@/hooks/use-web-view-modal';
import CloseIcon from '@/svg/paywall-close.svg';
import { Page } from '@/ui/page';
import { Pressable } from '@/ui/pressable';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

import { FeaturesArea } from './components/features-area';
import { TariffCheckboxes } from './components/tariff-checkboxes';

export function PaywallC() {
  const { antibot_enabled: isAntibotEnabled } = useConfig();
  const { validatePurchase } = usePnlight();
  const hasPremium = useHasPremiumWithBackdoor();
  const { hidePaywall } = usePaywall();
  const { logEvent } = useAnalytics();
  const [cheaperSubscription, setCheaperSubscription] =
    useState<IAPSubscription | null>(null);
  const { subscriptions, restorePurchases, purchaseProduct } = usePurchases();
  const { openModal: openWebViewModal } = useWebViewModal();

  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<
    IAPSubscription | undefined
  >(undefined);

  useEffect(() => {
    if (subscriptions) {
      const res =
        subscriptions.find((x) => x.periodUnit === 'week') ||
        subscriptions.find((x) => x.trial);
      setSelectedSubscription(res ?? subscriptions[0]);
      setCheaperSubscription(
        subscriptions.sort((a, b) => a.price - b.price)[0]
      );
    }
  }, [subscriptions]);

  const { formatPrice, formatPeriod } = useLocale();

  const subscribeButtonLabel = useMemo(() => {
    if (selectedSubscription?.trial) {
      const trialPeriod = formatPeriod(
        selectedSubscription.trial.periodUnit,
        selectedSubscription.trial.numberOfPeriods
      );

      return t('pages.paywall.start-trial', { text: trialPeriod });
    }

    if (selectedSubscription) {
      return `${formatPrice(selectedSubscription.price, selectedSubscription.currency)}/${formatPeriod(selectedSubscription.periodUnit, selectedSubscription.numberOfPeriods)}`;
    }
    return '';
  }, [formatPeriod, formatPrice, selectedSubscription]);

  const additionalText = useMemo(() => {
    if (selectedSubscription?.trial) {
      const trialPeriod = formatPeriod(
        selectedSubscription.trial.periodUnit,
        selectedSubscription.trial.numberOfPeriods
      );
      const price =
        selectedSubscription.currency === 'USD'
          ? '$' + Math.round(selectedSubscription.price * 100) / 100
          : formatPrice(
              selectedSubscription.price,
              selectedSubscription.currency
            );
      const subscriptionPeriod = formatPeriod(
        selectedSubscription.periodUnit,
        selectedSubscription.numberOfPeriods
      );

      return t('pages.paywall.additional-text', {
        trialPeriod,
        price,
        subscriptionPeriod,
      });
    }

    return t('pages.paywall.cancel-anytime');
  }, [formatPeriod, formatPrice, selectedSubscription]);

  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleSubscribe = useCallback(async () => {
    setIsPurchasing(true);

    await logEvent(
      `af_start_purchase*${selectedSubscription?.trial}_paywall_v_a`
    );
    if (hasPremium) {
      return;
    }
    if (selectedSubscription) {
      try {
        const isValid = isAntibotEnabled ? await validatePurchase() : true;
        if (!isValid) {
          throw new Error('Purchase failed');
        }

        const purchase = await purchaseProduct(selectedSubscription.id);
        if (!purchase?.transactionId) {
          throw new Error('Purchase failed');
        }
        hidePaywall();
      } catch {
        Alert.alert(t('basic.error'), t('pages.paywall.purchase-failed'));
      }
    }
    setIsPurchasing(false);
  }, [
    hasPremium,
    selectedSubscription,
    purchaseProduct,
    hidePaywall,
    logEvent,
  ]);

  useEffect(() => {
    logEvent('af_show_paywall_v3');
  }, []);

  return (
    <Page>
      <View className="flex-1">
        <View className="gap-y-2">
          <View className="flex-row items-center justify-between">
            <Pressable
              disabled={isPurchasing || isRestoring}
              onPress={async () => {
                setIsRestoring(true);
                const isRestored = await restorePurchases();
                Alert.alert(
                  t('pages.paywall.restore-purchases'),
                  isRestored
                    ? t('pages.paywall.purchase-restored')
                    : t('pages.paywall.no-purchases-found')
                );
                setIsRestoring(false);
              }}
            >
              {isPurchasing || isRestoring ? (
                <View className="items-center justify-center w-24">
                  <ActivityIndicator />
                </View>
              ) : (
                <UiText className="text-sm text-gray underline">
                  {t('pages.paywall.restore-purchases')}
                </UiText>
              )}
            </Pressable>
            <TouchableOpacity
              onPress={() => {
                logEvent('af_paywall_closed_v1');
                hidePaywall();
              }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>
          <UiText className="text-center text-2xl font-bold">
            {t('pages.paywall.unlock-everything')}
          </UiText>
          <UiText className="text-center text-lg font-medium text-grayDark">
            {t('pages.paywall.get-full-access')}
          </UiText>
        </View>

        <View className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-y-6">
              <FeaturesArea />

              <View className="gap-y-1">
                <UiText className="text-center text-xs text-gray">
                  {additionalText}
                </UiText>
                <TariffCheckboxes
                  cheaperSubscription={cheaperSubscription}
                  selectedSubscription={selectedSubscription}
                  subscriptions={subscriptions}
                  setSelectedSubscription={setSelectedSubscription}
                />
              </View>
            </View>
          </ScrollView>
        </View>

        <View className="pt-3">
          {selectedSubscription?.trial && (
            <UiText className="text-center text-sm text-grayDark">
              {t('pages.paywall.no-payment-due')}
            </UiText>
          )}
          <View className="items-center justify-center my-1">
            {isPurchasing ? (
              <ActivityIndicator
                size="large"
                color={colors.primary.toString()}
              />
            ) : (
              <UiButton disabled={isRestoring} onPress={handleSubscribe}>
                <UiText className="font-semibold text-white">
                  {selectedSubscription?.trial
                    ? subscribeButtonLabel
                    : 'Continue'}
                </UiText>
              </UiButton>
            )}
          </View>
          <View className="flex-row justify-center gap-x-1">
            <Pressable onPress={() => openWebViewModal(Env.TERMS_OF_USE)}>
              <UiText className="text-sm text-grayDark underline">
                {t('basic.terms-of-use')}
              </UiText>
            </Pressable>

            <UiText className="text-sm text-grayDark">&</UiText>

            <Pressable onPress={() => openWebViewModal(Env.PRIVACY_POLICY)}>
              <UiText className="text-sm text-grayDark underline">
                {t('basic.privacy-policy')}
              </UiText>
            </Pressable>
          </View>
        </View>
      </View>
    </Page>
  );
}
