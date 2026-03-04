import { type IapProduct, InAppPurchases } from '@kirz/expo-apphud';
import type { IAPSubscription } from '@kirz/expo-toolkit';
import { PromiseUtils } from '@kirz/expo-toolkit';

export function daysInProduct(product: IAPSubscription) {
  let days = 1;
  switch (product.periodUnit) {
    case 'day':
      days = product.numberOfPeriods;
      break;
    case 'week':
      days = product.numberOfPeriods * 7;
      break;
    case 'month':
      days = product.numberOfPeriods * 30;
      break;
    case 'quarter':
      days = product.numberOfPeriods * 90;
      break;
    case 'year':
      days = product.numberOfPeriods * 365;
      break;
    default:
      break;
  }
  return days;
}
export function trialDaysInProduct(product: IAPSubscription) {
  if (!product.trial) {
    return 0;
  }
  return daysInProduct(product.trial as IAPSubscription);
}

type PeriodUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

function convertToBestUnit(unit: number, numberOfPeriods: number): [PeriodUnit, number] {
  const unitMap: { [key: number]: PeriodUnit } = {
    0: 'day',
    1: 'week',
    2: 'month',
    3: 'year',
  };

  if (unit === 0) {
    // day
    if (numberOfPeriods % 7 === 0) {
      return ['week', numberOfPeriods / 7];
    }
  } else if (unit === 2) {
    // month
    if (numberOfPeriods % 3 === 0 && numberOfPeriods % 12 !== 0) {
      return ['quarter', numberOfPeriods / 3];
    }
    if (numberOfPeriods % 12 === 0) {
      return ['year', numberOfPeriods / 12];
    }
  }

  // Default case, return mapped unit and period
  return [unitMap[unit], numberOfPeriods];
}

export async function productsToSubscriptions(products: IapProduct[]): Promise<IAPSubscription[]> {
  const allSubscriptions = products.filter((x) => !!x.subscriptionPeriod);

  const processedForEligibilitySubscriptions = await Promise.all(
    allSubscriptions.map(async (subscription) => {
      let eligibleForTrial = false;
      try {
        eligibleForTrial = await PromiseUtils.timeout(
          InAppPurchases.isEligibleForTrial(subscription.id),
          10000,
          `Product eligibility check timed out for ${subscription.id}`
        );
      } catch (e) {
        console.warn(`Eligibility check failed for ${subscription.id}:`, e);
      }

      return {
        ...subscription,
        introductoryPrice: eligibleForTrial ? subscription.introductoryPrice : undefined,
      };
    })
  );

  return processedForEligibilitySubscriptions.map((x) => {
    const period = convertToBestUnit(
      x.subscriptionPeriod?.unit ?? 0,
      x.subscriptionPeriod?.numberOfUnits ?? 0
    );

    const trial =
      x.introductoryPrice && x.introductoryPrice.paymentMode === 2
        ? convertToBestUnit(
            x.introductoryPrice.subscriptionPeriod.unit,
            x.introductoryPrice.subscriptionPeriod.numberOfUnits
          )
        : false;

    return {
      id: x.id,
      title: x.localizedTitle,
      periodUnit: period[0],
      numberOfPeriods: period[1],
      price: x.price,
      currency: x.priceLocale.currencyCode,
      trial: trial ? { periodUnit: trial[0], numberOfPeriods: trial[1] } : null,
    };
  });
}
