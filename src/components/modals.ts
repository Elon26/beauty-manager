import { PropsWithChildren } from 'react';
import { Easing } from 'react-native';
import {
  createModalStack,
  type ModalOptions,
  type ModalStack,
} from 'react-native-modalfy';

import { PaywallModal } from '@/pages/paywall/components/paywall-modal';
import { ProtectSecretFolderModal } from '@/pages/pincode/components/protect-secret-folder-modal';
import { SecretPasswordModal } from '@/pages/secret-folder/components/secret-password-modal';
import { CreatePlanModal } from '@/pages/select-plan/components/create-plan-modal';
import { DuringFastingModal } from '@/pages/select-plan/components/during-fasting-modal';
import { PreparingForFastingModal } from '@/pages/select-plan/components/preparing-for-fasting-modal';
import { ConnectionErrorModal } from '@/pages/speed-test/components/connection-error-modal';

import { CleanerHappyModal } from './cleaner-happy-modal';
import { CleaningModal } from './cleaning-modal';
import { LimitDeletionsModal } from './limit-deletions-modal';
import { LoaderModal } from './loader-modal';
import { SuccessModal } from './success-modal';

const defaultOptions: ModalOptions = {
  position: 'center',
  disableFlingGesture: true,
  backBehavior: 'none',
  backdropOpacity: 0.2,
  animateInConfig: {
    easing: Easing.inOut(Easing.exp),
    duration: 1000,
  },
} as const;

export type ModalStackParams = {
  LoaderModal: typeof LoaderModal;
  SuccessModal: {
    filesQuantity: number;
    freedSpace: string;
  };
  CleanerHappyModal: PropsWithChildren;
  CleaningModal: never;
  CreatePlanModal: {
    setPlan: () => void;
    close: () => void;
  };
  SecretPasswordModal: {
    id?: string;
  };
  LimitDeletionsModal: {
    count: number;
  };
  Paywall: {
    type: 'a' | 'b' | 'c';
  };
  PreparingForFastingModal: never;
  DuringFastingModal: never;
  ConnectionErrorModal: {
    resolve: (value: unknown) => void;
  };
  ProtectSecretFolderModal: {
    handleAdd: () => void;
    close: () => void;
  };
};

export const modalsStack: ModalStack<ModalStackParams> = createModalStack(
  {
    LoaderModal,
    SuccessModal,
    CleanerHappyModal,
    CleaningModal,
    CreatePlanModal: {
      modal: CreatePlanModal,
      position: 'top',
    },
    LimitDeletionsModal,
    SecretPasswordModal: {
      modal: SecretPasswordModal,
      disableFlingGesture: false,
    },
    Paywall: {
      modal: PaywallModal,
      position: 'top',
    },
    PreparingForFastingModal,
    DuringFastingModal,
    ConnectionErrorModal,
    ProtectSecretFolderModal,
  },
  defaultOptions
);
