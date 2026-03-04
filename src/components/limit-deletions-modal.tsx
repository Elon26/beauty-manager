import { useAnalytics } from '@kirz/expo-toolkit';
import { useEffect } from 'react';
import { InteractionManager, TouchableOpacity, View } from 'react-native';
import type { ModalComponentProp } from 'react-native-modalfy';

import type { ModalStackParams } from '@/components/modals';
import { usePaywall } from '@/hooks/use-paywall';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

type LimitDeletionsModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  'LimitDeletionsModal'
>;

export function LimitDeletionsModal({
  modal: { params, closeModal },
}: LimitDeletionsModalProps) {
  const { showPaywall } = usePaywall();
  const { logEvent } = useAnalytics();
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      logEvent('dialog_sub_limit');
    });
  }, [logEvent]);
  return (
    <View className="rounded-2xl bg-background gap-4 p-4 w-72">
      <View className="items-center gap-3 py-4">
        <UiText className="text-center text-xl font-semibold">
          You’ve reached the deletion limit of {params?.count ?? 0} files
        </UiText>
        <UiText className="text-center text-sm">
          Upgrade to premium to delete without restrictions and keep things
          tidy.
        </UiText>
      </View>
      <View className="gap-2">
        <UiButton
          className="w-full"
          onPress={() => {
            logEvent('dialog_limit_sub_click');
            closeModal(undefined, showPaywall);
          }}
        >
          <UiText className="font-semibold text-white">Get Premium</UiText>
        </UiButton>
        <TouchableOpacity
          className="items-center justify-center overflow-hidden rounded-2xl bg-primary h-13"
          onPress={() => {
            logEvent('dialog_limit_sub_cancel');
            closeModal();
          }}
        >
          <UiText className="font-semibold text-white">Back</UiText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
