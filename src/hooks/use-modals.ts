import { useModal } from 'react-native-modalfy';

import { ModalStackParams } from '@/components/modals';

export function useModals() {
  return useModal<ModalStackParams>();
}
