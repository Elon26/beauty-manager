import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

import { useModals } from '@/hooks/use-modals';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

export function ProtectFilesModal() {
  const { closeModal } = useModals();

  return (
    <View className="rounded-2xl bg-background gap-4 p-4 w-72">
      <View className="items-center gap-3 py-4">
        <UiText className="text-center text-xl font-semibold">
          Protect your private files
        </UiText>
        <UiText className="text-center text-sm">
          Add a passcode to make sure only you can access your personal media.
        </UiText>
      </View>
      <View className="gap-2">
        <UiButton
          className="w-full"
          onPress={() => {
            closeModal('ProtectFilesModal', () => {
              router.navigate('/set-pin');
            });
          }}
        >
          <UiText className="font-medium text-white">Set a passcode</UiText>
        </UiButton>
        <TouchableOpacity
          className="items-center justify-center overflow-hidden rounded-2xl bg-gray h-13"
          onPress={() => closeModal('ProtectFilesModal')}
        >
          <UiText className="text-base font-semibold text-white">Later</UiText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
