import type { CNContactWithImageData } from '../src/ContactsKit.types';
import type { RContact } from './types';
import { useSelector } from '@xstate/store/react';
import { useEffect } from 'react';
import { isNotNullOrUndefined } from '@/utils/array';
import ContactsKitModule from '../src/ContactsKitModule';
import {
  type SimilarityField,
  defaultCreateOrImportPrompt,
  defaultMergeContactsPrompt,
  defaultRemoveAfterImportPrompt,
  defaultRestoreAfterDeletePrompt,
} from './constants';
import { privateContactsStore } from './private-store';
import { store } from './store';
import { usePromise } from './use-promise';

/**
 * Get the list of contact IDs and fetching status.
 * This hook will automatically fetch the contact IDs if they are not already loaded.
 * Use this hook to create a list of contacts. Get the contact details using `useContact(id)` hook.
 * @returns An object containing the contact IDs, fetching status, and a refetch function.
 */
export function useContactIds() {
  const status = useSelector(store, (state) => state.context.cnContactsStatus);
  const ids = useSelector(store, (state) => state.context.cnContactIds);
  useEffect(() => {
    if (status === 'idle') {
      store.send({ type: 'FETCH' });
    }
  }, [status]);

  return {
    ids,
    status,
    refetch: () => {
      store.send({ type: 'FETCH' });
    },
  };
}

/**
 * Get the list of "poor" contacts.
 * @returns The list of contacts.
 */
export function useCnContacts() {
  return useSelector(store, (state) => state.context.cnContacts);
}

/**
 * Fetches the contact details for a given contact ID.
 * @param id The contact ID to fetch.
 * @returns The contact details, including the display name and image URIs or null if the contact does not exist.
 */
export function useContact(id: string): RContact | null {
  const images = usePromise(ContactsKitModule.getContactImage(id));
  const contact = useSelector(store, (state) => state.context.cnContacts[id]);

  if (!contact) {
    return null;
  }

  const displayName = [
    contact.namePrefix,
    contact.givenName,
    contact.middleName,
    contact.familyName,
    contact.nameSuffix,
  ]
    .filter(Boolean)
    .join(' ');

  const contactExtended = {
    ...contact,
    displayName,
    image: {
      full: contact.imageDataAvailable ? images?.imageUri : null,
      thumbnail: contact.imageDataAvailable ? images?.thumbnailUri : null,
    },
  };

  return contactExtended;
}

/**
 * Fetches similar contacts based on a specific field (name, phone, or any).
 * @param field The field to use for similarity comparison. Can be 'name', 'phone', or 'any'.
 * @returns An object containing the groups of similar contact IDs, the fetching status, and a refetch function.
 */
export function useContactsSimilarByField(field: SimilarityField) {
  const status = useSelector(store, (state) => state.context.similarGroups[field].status);
  const idGroups = useSelector(store, (state) => state.context.similarGroups[field].idGroups);

  useEffect(() => {
    if (status === 'idle') {
      store.send({ type: 'FETCH_SIMILAR', field });
    }
  }, [status, field]);

  return {
    idGroups,
    status,
    refetch: () => {
      store.send({ type: 'FETCH_SIMILAR', field });
    },
  };
}

/**
 * Fetches incomplete contacts.
 * @returns An object containing the IDs of incomplete contacts, the fetching status, and a refetch function.
 */
export function useContactsIncomplete() {
  const status = useSelector(store, (state) => state.context.incomplete.status);
  const ids = useSelector(store, (state) => state.context.incomplete.ids);

  useEffect(() => {
    if (status === 'idle') {
      store.send({ type: 'FETCH_INCOMPLETE' });
    }
  }, [status]);

  return {
    ids,
    status,
    refetch: () => {
      store.send({ type: 'FETCH_INCOMPLETE' });
    },
  };
}

/**
 * Merges each group of contact IDs into a single contact.
 * This function will pause updates, perform the merge, and then resume updates.
 * It will also trigger a 'CONTACTS_CHANGED' event to update the UI.
 * @param idGroups An array of arrays, where each inner array contains contact IDs to be merged.
 */
export async function mergeContacts(idGroups: string[][]) {
  store.send({ type: 'PAUSE_UPDATES' });
  try {
    for (const group of idGroups) {
      await ContactsKitModule.mergeContacts(group);
    }
  } catch (error) {
    console.error('Error merging contacts:', error);
  } finally {
    store.send({ type: 'RESUME_UPDATES' });
    store.send({ type: 'CONTACTS_CHANGED' });
  }
}

export async function mergeContactsWithPrompt(
  idGroups: string[][],
  mergePrompt = defaultMergeContactsPrompt
) {
  const continueMerge = await mergePrompt(idGroups);
  if (continueMerge) {
    await mergeContacts(idGroups);
  }
}

/**
 * Gets the list of private contact IDs and fetching status.
 * This hook will automatically fetch the private contact IDs if they are not already loaded.
 * Use this hook to create a list of private contacts. Get the contact details using `usePrivateContact(id)` hook.
 * @returns An object containing the private contact IDs, fetching status, and a refetch function.
 */
export function usePrivateContactIds() {
  const status = useSelector(
    privateContactsStore,
    (state) => state.context.privateCnContactsStatus
  );
  const ids = useSelector(privateContactsStore, (state) => state.context.privateCnContactIds);

  const idsSorted = [...ids].sort((a, b) => {
    const contactA = privateContactsStore.getSnapshot().context.privateCnContacts[a];
    const contactB = privateContactsStore.getSnapshot().context.privateCnContacts[b];
    if (!contactA || !contactB) {
      return 0;
    }
    const nameA = (contactA.givenName || '') + (contactA.familyName || '');
    const nameB = (contactB.givenName || '') + (contactB.familyName || '');
    return nameA.localeCompare(nameB);
  });

  useEffect(() => {
    if (status === 'idle') {
      privateContactsStore.send({ type: 'FETCH' });
    }
  }, [status]);

  return {
    ids: idsSorted,
    status,
    refetch: () => {
      privateContactsStore.send({ type: 'FETCH' });
    },
  };
}

export function usePrivateCnContacts() {
  return useSelector(privateContactsStore, (state) => state.context.privateCnContacts);
}

/**
 * Fetches the private contact details for a given contact ID.
 * @param id The private contact ID to fetch.
 * @returns The private contact details, including the display name and image URIs or null if the contact does not exist.
 */
export function usePrivateContact(id: string): RContact | null {
  const contact = useSelector(privateContactsStore, (state) => state.context.privateCnContacts[id]);
  if (!contact) {
    return null;
  }

  const displayName = [
    contact.namePrefix,
    contact.givenName,
    contact.middleName,
    contact.familyName,
    contact.nameSuffix,
  ]
    .filter(Boolean)
    .join(' ');

  const contactExtended = {
    ...contact,
    displayName,
    image: {
      full: contact.imageDataAvailable ? `data:image/jpeg;base64,${contact.imageData}` : null,
      thumbnail: contact.imageDataAvailable
        ? `data:image/jpeg;base64,${contact.thumbnailImageData}`
        : null,
    },
  };

  return contactExtended;
}

/**
 * Imports private contacts from the address book.
 * Presents a contact picker to the user, allowing them to select contacts to import.
 * After selection, it asks whether to remove the contacts from the address book after importing.
 * If confirmed, it saves the selected contacts as private contacts and optionally removes them from the address book.
 * @param removeAfterImportPrompt Optional function to prompt the user whether to remove contacts after importing.
 * @param limit Optional limit on the number of contacts to import.
 * Resolve with true to remove, false to not remove, reject to not remove. Defaults to an action sheet prompt.
 */
export async function importPrivateContactsFromAddressBook(
  removeAfterImportPrompt = defaultRemoveAfterImportPrompt,
  limit?: number
) {
  const selected = await ContactsKitModule.presentContactPicker({ appearance: 'light' });

  if (!selected || selected.length === 0) {
    return {
      data: [] as CNContactWithImageData[],
      error: 'no items selected' as const,
    };
  }

  const limited = selected.slice(0, limit);

  const removeAfterImport = await removeAfterImportPrompt().catch(() => false);
  await ContactsKitModule.saveContactsAsPrivate(limited.map(({ identifier }) => identifier));
  if (removeAfterImport) {
    for (const contact of limited) {
      await ContactsKitModule.removeContact(contact.identifier).catch(console.error);
    }
  }

  return {
    data: limited,
    error: selected.length > limited.length ? ('limit exceeded' as const) : null,
  };
}

/**
 * Creates a new private contact by presenting a contacts editor.
 * This function will open the contacts editor where the user can enter details for a new private contact.
 * If the user cancels the editor, it will return null.
 * @return A promise that resolves to a CNContactWithImageData object representing the created contact, or null if the user cancelled the editor.
 * */
export async function createPrivateContact() {
  return ContactsKitModule.presentContactsEditor({ appearance: 'light' });
}

type CreateOrImportPrivateContactParams = {
  createOrImportPrompt?: () => Promise<'create' | 'import'>;
  removeAfterImportPrompt?: () => Promise<boolean>;
  limit?: number;
};
/**
 * Creates or imports a private contact based on user choice.
 * This function will prompt the user to choose between creating a new private contact or importing contacts from the address book.
 * If the user chooses to import, it will call `importPrivateContactsFromAddressBook`.
 * If the user chooses to create, it will call `createPrivateContact`.
 * @param createOrImportPrompt Optional function to prompt the user whether to create or import a contact.
 * Resolve with 'create' to create a new contact, 'import' to import contacts, reject to cancel. Defaults to an action sheet prompt.
 * @param removeAfterImportPrompt Optional function to prompt the user whether to remove contacts after importing.
 * Resolve with true to remove, false to not remove, reject to cancel. Defaults to an action sheet prompt.
 * @param limit Optional limit on the number of contacts to import.
 * @return A promise that resolves to a CNContactWithImageData object representing the created contact, or null if the user cancelled the editor.
 * @throws Error if the user chooses an invalid action.
 */
export async function createOrImportPrivateContact({
  createOrImportPrompt = defaultCreateOrImportPrompt,
  removeAfterImportPrompt = defaultRemoveAfterImportPrompt,
  limit,
}: CreateOrImportPrivateContactParams = {}): Promise<{
  data: CNContactWithImageData[];
  error: 'limit exceeded' | 'no items selected' | null;
}> {
  let error: 'limit exceeded' | null = null;
  if (limit === 0) {
    error = 'limit exceeded';
    return {
      data: [],
      error,
    };
  }

  const action = await createOrImportPrompt();
  if (action === 'import') {
    return await importPrivateContactsFromAddressBook(removeAfterImportPrompt, limit);
  } else if (action === 'create') {
    const contact = await createPrivateContact();
    return { data: [contact].filter(isNotNullOrUndefined), error };
  } else {
    throw new Error('Invalid action');
  }
}

/**
 * Delete private contacts by their IDs.
 * This function will prompt the user to confirm whether they want to restore the contacts to their address book after deletion.
 * If confirmed, it will save the contacts as address book contacts before deleting them.
 * @param ids An array of private contact IDs to delete.
 * @param restoreAfterDeletePrompt Optional function to prompt the user whether to restore contacts after deletion.
 * Resolve with true to restore, false to not restore, reject to cancel. Defaults to an action sheet prompt.
 */
export async function deletePrivateContacts(
  ids: string[],
  restoreAfterDeletePrompt = defaultRestoreAfterDeletePrompt
) {
  const restoreToAddressBook = await restoreAfterDeletePrompt();
  for (const contactId of ids) {
    if (restoreToAddressBook) {
      try {
        await ContactsKitModule.savePrivateAsContact(contactId);
      } catch (error) {
        if (error instanceof Error && error.message === 'Duplicate Record') {
          console.warn(`Contact with ID ${contactId} already exists in the address book.`);
        } else {
          throw error;
        }
      }
    }
    await ContactsKitModule.deletePrivateContact(contactId);
  }
}

/**
 * Presents a contact viewer for a specific contact. Pass either contactId or privateId to view address book or private contact respectively.
 * @param contactId The identifier of the address book contact to view.
 * @param privateId The identifier of the private contact to view.
 * @param appearance Optional appearance settings for the contact viewer, can be 'light' or 'dark'.
 * @param dismissButtonTitle Optional title for the dismiss button.
 * @param title Optional title for the contact viewer modal.
 */
export const presentContactViewer = ContactsKitModule.presentContactViewer;

/**
 * Presents a contacts editor for a private contact.
 * @param contactId The identifier of the private contact to edit. If not provided, a new contact editor will be presented.
 * @param appearance Optional appearance settings for the contacts editor, can be 'light' or 'dark'.
 * @param dismissButtonTitle Optional title for the dismiss button.
 * @param title Optional title for the contacts editor modal.
 * @return A promise that resolves to a CNContactWithImageData object representing the edited contact, or null if the user cancelled the editor.
 */
export const presentPrivateContactEditor = ContactsKitModule.presentContactsEditor;

/**
 * Deletes a contact from the address book by its identifier.
 * @param contactId The identifier of the contact to delete.
 * @returns A promise that resolves to an object containing the identifier of the deleted contact.
 */
export const removeContact = ContactsKitModule.removeContact;
