import type { Password } from './types';
import { createStore } from '@xstate/store';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import {
  isAutoFillEnabled,
  removeCredentialIdentities,
  saveCredentialIdentities,
} from '@/modules/keychain-manager';

const PASSWORDS_SECURE_KEY = 'secret-passwords-secure-key';

type SecretPasswordsStoreInitialState = {
  autofillEnabled: boolean | undefined;
  isFetching: boolean;
  isError: boolean;
  isLoaded: boolean;
  errorMessage: string | undefined;
  passwords: Password[] | undefined;
};

const initialState: SecretPasswordsStoreInitialState = {
  autofillEnabled: undefined,
  isFetching: false,
  isError: false,
  isLoaded: false,
  errorMessage: undefined,
  passwords: undefined,
};

export const secretPasswordsStore = createStore({
  context: initialState,
  on: {
    setAutofillEnabled: (context, event: { data: boolean }) => ({
      ...context,
      autofillEnabled: event.data,
    }),
    setError: (context, event: { data: string }) => ({
      ...context,
      errorMessage: event.data,
    }),
    clearError: (context) => ({
      ...context,
      errorMessage: undefined,
    }),
    setIsLoaded: (context, event: { data: boolean }) => ({
      ...context,
      isLoaded: event.data,
    }),
    setIsFetching: (context, event: { data: boolean }) => ({
      ...context,
      isFetching: event.data,
    }),
    setIsError: (context, event: { data: boolean }) => ({
      ...context,
      isError: event.data,
    }),
    setSecretPasswords: (context, event: { data: Password[] }) => ({
      ...context,
      passwords: event.data,
    }),

    addPassword: (context, event: { data: Password }, enqueue) => {
      const newPasswords = [...(context.passwords ?? [])];
      newPasswords.push(event.data);
      enqueue.emit.passwordsMutated({ newPasswords });
      enqueue.emit.passwordAdded({ addedPassword: event.data });
      return {
        ...context,
        passwords: newPasswords,
      };
    },
    deletePassword: (context, event: { data: Password }, enqueue) => {
      const newPasswords = [...(context.passwords ?? [])].filter(
        (password) => password.id !== event.data.id
      );
      enqueue.emit.passwordsMutated({ newPasswords });
      enqueue.emit.passwordDeleted({ deletedPassword: event.data });
      return {
        ...context,
        passwords: newPasswords,
      };
    },
    updatePassword: (context, event: { data: Password }, enqueue) => {
      const newPasswords = [...(context.passwords ?? [])];
      const index = newPasswords.findIndex((password) => password.id === event.data.id);
      if (index !== -1) {
        newPasswords[index] = event.data;
      }
      enqueue.emit.passwordsMutated({ newPasswords });
      enqueue.emit.passwordUpdated({ updatedPassword: event.data });
      return {
        ...context,
        passwords: newPasswords,
      };
    },
  },
  emits: {
    // side effects
    passwordsMutated: (payload: { newPasswords: Password[] }) => {
      SecureStore.setItemAsync(PASSWORDS_SECURE_KEY, JSON.stringify(payload.newPasswords)).catch(
        console.error
      );
    },
    passwordAdded: (payload: { addedPassword: Password }) => {
      const { link, login, id } = payload.addedPassword;
      saveCredentialIdentities(link, login, id).catch(console.error);
    },
    passwordDeleted: (payload: { deletedPassword: Password }) => {
      const { link, login, id } = payload.deletedPassword;
      removeCredentialIdentities(link, login, id).catch(console.error);
    },
    passwordUpdated: (payload: { updatedPassword: Password }) => {
      const { link, login, id } = payload.updatedPassword;
      saveCredentialIdentities(link, login, id).catch(console.error);
    },
  },
});
updateAutofillStatus();
fetchPasswords();

// MARK: - Initialization

AppState.addEventListener('change', async (status) => {
  if (status === 'active') {
    updateAutofillStatus();
  }
});

async function updateAutofillStatus() {
  const isEnabled = await isAutoFillEnabled();
  secretPasswordsStore.send({ type: 'setAutofillEnabled', data: isEnabled });
}

async function fetchPasswords() {
  secretPasswordsStore.send({ type: 'setIsFetching', data: true });
  try {
    const storedPasswords = await SecureStore.getItemAsync(PASSWORDS_SECURE_KEY);
    if (!storedPasswords) {
      throw new Error('No passwords found');
    }
    const parsed = JSON.parse(storedPasswords) as Password[];
    secretPasswordsStore.send({ type: 'setSecretPasswords', data: parsed });
    secretPasswordsStore.send({ type: 'setIsLoaded', data: true });
    secretPasswordsStore.send({ type: 'setIsError', data: false });
  } catch (error) {
    if (error instanceof Error) {
      secretPasswordsStore.send({ type: 'setIsError', data: true });
      secretPasswordsStore.send({ type: 'setError', data: error.message });
    }
    if (error instanceof Error && error.message === 'No passwords found') {
    } else {
      console.error('Error fetching passwords:', error);
    }
  } finally {
    secretPasswordsStore.send({ type: 'setIsFetching', data: false });
  }
}
