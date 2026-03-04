import { View } from 'react-native';
import type { ModalComponentProp } from 'react-native-modalfy';

import type { ModalStackParams } from '@/components/modals';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

type AddedFilesModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  'AddedFilesModal'
>;

export function AddedFilesModal({
  modal: { params, closeModal },
}: AddedFilesModalProps) {
  return (
    <View className="rounded-2xl bg-white gap-4 p-4 w-72">
      <View className="items-center gap-3 py-4">
        <UiText className="text-center text-xl font-semibold">Done!</UiText>
        <UiText className="text-center text-sm">
          {params?.count ?? 0} {params?.count === 1 ? 'item has' : 'items have'}{' '}
          been added to your Private Space.
        </UiText>
      </View>
      <View className="gap-2">
        <UiButton className="w-full" onPress={() => closeModal()}>
          <UiText className="font-semibold text-white">OK</UiText>
        </UiButton>
      </View>
    </View>
  );
}
