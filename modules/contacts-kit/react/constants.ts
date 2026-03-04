import { ActionSheetIOS } from 'react-native';
import { Deferred } from './deferred';

export const CnContactsStatuses = {
  idle: 'idle',
  loading: 'loading',
  error: 'error',
  fetched: 'fetched',
} as const;
export type CnContactsStatus = (typeof CnContactsStatuses)[keyof typeof CnContactsStatuses];

export const SimilarityFields = {
  name: 'name',
  phone: 'phone',
  any: 'any',
} as const;
export type SimilarityField = (typeof SimilarityFields)[keyof typeof SimilarityFields];

export function defaultRemoveAfterImportPrompt() {
  const deferred = new Deferred<boolean>();
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', 'Remove', 'Later'],
      cancelButtonIndex: 0,
      userInterfaceStyle: 'light',
      title: 'Remove After Import',
      message:
        'Imported files will be removed from Photos after every import. You can change it in the app settings anytime.',
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        deferred.reject('User cancelled');
      } else if (buttonIndex === 1) {
        deferred.resolve(true);
      } else if (buttonIndex === 2) {
        deferred.resolve(false);
      }
    }
  );
  return deferred.promise;
}

export function defaultRestoreAfterDeletePrompt() {
  const deferred = new Deferred<boolean>();
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', 'Yes', 'No'],
      cancelButtonIndex: 0,
      userInterfaceStyle: 'light',
      title: 'Restore contacts to address book',
      message: 'Do you want to restore the contacts to your address book after deleting them?',
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        deferred.reject('User cancelled');
      } else if (buttonIndex === 1) {
        deferred.resolve(true);
      } else if (buttonIndex === 2) {
        deferred.resolve(false);
      }
    }
  );
  return deferred.promise;
}

export function defaultCreateOrImportPrompt() {
  const deferred = new Deferred<'create' | 'import'>();
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', 'Add from device', 'Add new contact'],
      cancelButtonIndex: 0,
      userInterfaceStyle: 'light',
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        deferred.reject('User cancelled');
      } else if (buttonIndex === 1) {
        deferred.resolve('import');
      } else if (buttonIndex === 2) {
        deferred.resolve('create');
      }
    }
  );
  return deferred.promise;
}

export function defaultMergeContactsPrompt(groups: string[][]) {
  const deferred = new Deferred<boolean>();
  if (groups.length === 0) {
    deferred.resolve(false);
    return deferred.promise;
  }
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: [
        'Cancel',
        `Merge ${groups.flat().length} contacts into ${groups.length} contact${
          groups.length === 1 ? '' : 's'
        }`,
      ],
      cancelButtonIndex: 0,
      userInterfaceStyle: 'light',
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        deferred.reject('User cancelled');
      } else if (buttonIndex === 1) {
        deferred.resolve(true);
      }
    }
  );
  return deferred.promise;
}
