import { IAPSubscription, useLocale } from '@kirz/expo-toolkit';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Checkbox } from '@/ui/checkbox';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

export function TariffCheckboxes({
  selectedSubscription,
  subscriptions,
  setSelectedSubscription,
  cheaperSubscription,
}: {
  selectedSubscription: IAPSubscription | undefined;
  cheaperSubscription: IAPSubscription | null;
  subscriptions: IAPSubscription[] | undefined;
  setSelectedSubscription: (subscription: IAPSubscription) => void;
}) {
  const { formatPrice, formatPeriod } = useLocale();

  return (
    <View className="rounded-3xl gap-y-2">
      {subscriptions?.map((subscription) => {
        const isSelected = subscription.id === selectedSubscription?.id;

        const priceText =
          subscription.currency === 'USD'
            ? '$' + Math.round(subscription.price * 100) / 100
            : formatPrice(subscription.price, subscription.currency);
        const subscriptionPeriodText = formatPeriod(
          subscription.periodUnit,
          subscription.numberOfPeriods
        );

        return (
          <Pressable
            key={subscription.id}
            className={twMerge(
              'flex-row items-center justify-between rounded-2xl bg-grayLight gap-x-4 p-4'
            )}
            onPress={() => setSelectedSubscription(subscription)}
          >
            <View className="gap-y-1">
              <UiText className="font-bold">
                {priceText}/{subscriptionPeriodText}
              </UiText>
              {subscription.trial ? (
                <UiText className="text-grayDark">
                  {t('pages.paywall.trial-period', {
                    trialPeriod: formatPeriod(
                      subscription.trial.periodUnit,
                      subscription.trial.numberOfPeriods
                    ),
                  })}
                </UiText>
              ) : (
                <UiText className="capitalize text-grayDark">
                  {subscriptionPeriodText}
                </UiText>
              )}
            </View>
            <Checkbox
              checked={isSelected}
              onChange={() => {
                setSelectedSubscription(subscription);
              }}
              isAltView
            />
          </Pressable>
        );
      })}
    </View>
  );
}
