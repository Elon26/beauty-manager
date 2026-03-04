import { useWindowDimensions, View } from 'react-native';
import { ModalComponentProp } from 'react-native-modalfy';

import { useModals } from '@/hooks/use-modals';
// import { useContactsCleaner } from '@/pages/contacts-cleaner/hooks/use-contacts-cleaner';
import { UiText } from '@/ui/ui-text';

import { ModalStackParams } from './modals';

export function SuccessModal({
  modal: { params },
}: ModalComponentProp<ModalStackParams, object, 'SuccessModal'>) {
  const { closeModal } = useModals();
  const { width, height } = useWindowDimensions();
  // const { isScanningForSimilarContacts } = useContactsCleaner();

  return (
    <View
      className="items-center justify-center bg-black py-8"
      style={{ width, height }}
    >
      <View className="items-center -mt-10">
        {/* <Image className="size-64" source={BowlsImage} style={{}} /> */}
      </View>
      <View className="gap-y-3 mb-8">
        <UiText className="text-center text-3xl font-bold">
          Congratulations!
        </UiText>
        <UiText className="text-center text-gray">
          Your device has gotten better!
        </UiText>
      </View>
      <UiText className="text-center text-xl font-medium mb-3">
        You were able to remove:
      </UiText>
      <View className="rounded-2xl bg-white/10 mx-10 mb-15 py-3">
        <View className="flex-row justify-center gap-x-1 mx-10">
          <UiText className="font-semibold color-[#81F763]">
            {params?.filesQuantity || '0'} file
            {params?.filesQuantity === 1 ? '' : 's'}
          </UiText>
          <UiText className="text-gray">that were taking up</UiText>
        </View>
        <View className="h-[1px] bg-white/10 my-2" />
        <View className="flex-row justify-center gap-x-1 mx-10">
          <UiText className="font-semibold color-[#81F763]">
            {params?.freedSpace || '0 bytes'}
          </UiText>
          <UiText className="text-gray">of your phone's space</UiText>
        </View>
      </View>
      <View className="px-10 w-full">
        {/* {isScanningForSimilarContacts ? (
          <Btn size="big" label="Updating..." handler={() => {}} disabled />
        ) : (
          <Btn
            size="big"
            label="Continue"
            handler={() => closeModal('SuccessModal')}
          />
        )} */}
      </View>
    </View>
  );
}
