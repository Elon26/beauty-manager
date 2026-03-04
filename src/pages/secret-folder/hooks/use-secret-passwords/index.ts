import type { Password } from './types';
import { useSelector } from '@xstate/store/react';
import { uuid } from '@/utils/uuid';
import { getNameAndFavicon } from './helper';
import { secretPasswordsStore } from './store';

export function useSecretPasswords() {
  const context = useSelector(secretPasswordsStore, (store) => store.context);
  return context;
}

export function useSecretPassword(id: string) {
  const passwords = useSelector(secretPasswordsStore, (store) => store.context.passwords) ?? [];
  const password = passwords.find((password) => password.id === id);
  return password;
}

// MARK: - Methods

type AddPasswordPayload = Pick<Password, 'link' | 'login' | 'password'>;

export async function addPassword({ login, link, password }: AddPasswordPayload) {
  const id = uuid();
  const { image, name } = await getNameAndFavicon(link);

  const newPassword: Password = {
    id,
    link,
    login,
    password,
    image,
    name,
  };

  secretPasswordsStore.trigger.addPassword({ data: newPassword });
}

export function deletePassword(password: Password) {
  secretPasswordsStore.trigger.deletePassword({ data: password });
}

type UpdatePasswordPayload = Pick<Password, 'link' | 'login' | 'password' | 'id'>;

export async function updatePassword({ login, link, password, id }: UpdatePasswordPayload) {
  const { image, name } = await getNameAndFavicon(link);

  const data = {
    id,
    link,
    login,
    password,
    image,
    name,
  };

  secretPasswordsStore.trigger.updatePassword({ data });
}
