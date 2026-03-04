import { useAnalytics } from '@kirz/expo-toolkit';
import { atom, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useModal } from 'react-native-modalfy';

import type { ModalStackParams } from '@/components/modals';

import { useConfig } from './use-config';
import { useHasPremiumWithBackdoor } from './use-developer-purchases';

export const shownPaywallAtom = atom<boolean>(false);

export function usePaywall() {
  const hasPremium = useHasPremiumWithBackdoor();

  const modal = useModal<ModalStackParams>();
  const setShownPaywall = useSetAtom(shownPaywallAtom);
  const { in_app_paywall_id } = useConfig();
  const { logEvent } = useAnalytics();

  const showPaywall = useCallback(
    (type: ModalStackParams['Paywall']['type'] = in_app_paywall_id) => {
      modal.openModal('Paywall', { type });
      setShownPaywall(true);
    },
    [modal, setShownPaywall, in_app_paywall_id]
  );
  useEffect(() => {
    logEvent(`af_show_paywall_v_${in_app_paywall_id}`);
  }, [in_app_paywall_id, logEvent]);

  const hidePaywall = useCallback(() => {
    logEvent(`af_paywall_closed_v_${in_app_paywall_id}`);
    modal.closeModal('Paywall');
    setShownPaywall(false);
  }, [modal, setShownPaywall]);

  const premiumAction = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    <T extends any[]>(fn: (...args: T) => any) => {
      return (...args: T) => {
        if (hasPremium) {
          return fn(...args);
        }
        showPaywall();
      };
    },
    [showPaywall, hasPremium]
  );

  return {
    isLoading: hasPremium == null,
    showPaywall,
    hidePaywall,
    premiumAction,
  };
}
