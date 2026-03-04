import { NativeModule, requireNativeModule } from 'expo';

import type {
  CNContact,
  CNContactWithImageData,
  ContactsKitModuleEvents,
} from './ContactsKit.types';

type StringSimilarityAlgorithm = 'levenshtein' | 'jaroWinkler' | 'bigram' | 'hybrid';
type Appearance = 'light' | 'dark';
type PresentContactViewerOptions = {
  appearance?: Appearance;
  dismissButtonTitle?: string;
  title?: string;
} & (
  | {
      contactId: string;
      privateId?: never;
    }
  | {
      privateId: string;
      contactId?: never;
    }
);
type PresentContactsEditorOptions = {
  appearance?: Appearance;
  dismissButtonTitle?: string;
  contactId?: string;
  title?: string;
};

declare class ContactsKitModule extends NativeModule<ContactsKitModuleEvents> {
  /**
   * Fetches all the contacts from the native module.
   * @returns A promise that resolves to an array of CNContact objects.
   */
  fetchContacts(): Promise<CNContact[]>;
  /**
   * Fetches all incomplete contacts from the native module.
   * @returns A promise that resolves to an array of CNContact objects.
   */
  fetchIncompleteContacts(): Promise<CNContact[]>;
  /**
   * Fetches contacts similar by a phone number.
   * @param comparedSuffixLength The length of the phone number suffix to compare (e.g., 4 for the last 4 digits). 6 seems to be a good default.
   * @returns A promise that resolves to an array of arrays of CNContact objects, where each inner array contains similar contacts.
   */
  getSimilarByPhoneNumber(comparedSuffixLength: number): Promise<CNContact[][]>;
  /**
   * Fetches contacts similar by name.
   * @param threshold The similarity threshold for the name comparison. 0.825 is a good default.
   * @param algo The algorithm to use for string similarity comparison. Can be 'levenshtein', 'jaroWinkler', 'bigram', or 'hybrid'. Use 'hybrid' for a good balance between performance and accuracy.
   * @returns A promise that resolves to an array of arrays of CNContact objects, where each inner array contains similar contacts.
   */
  getSimilarByName(threshold: number, algo: StringSimilarityAlgorithm): Promise<CNContact[][]>;
  /**
   * Fetches contacts similar by name or phone number.
   * @param threshold The similarity threshold for the name comparison.
   * @param algo The algorithm to use for string similarity comparison. Can be 'levenshtein', 'jaroWinkler', 'bigram', or 'hybrid'. Use 'hybrid' for a good balance between performance and accuracy.
   * @param comparedPhoneSuffixLength The length of the phone number suffix to compare (e.g., 4 for the last 4 digits). 6 seems to be a good default.
   * @returns A promise that resolves to an array of arrays of CNContact objects, where each inner array contains similar contacts.
   */
  getSimilarByNameOrPhone(
    threshold: number,
    algo: StringSimilarityAlgorithm,
    comparedPhoneSuffixLength: number
  ): Promise<CNContact[][]>;
  /**
   * Fetches a contact image and thumbnail by contact ID.
   * @param contactId The identifier of the contact to fetch the image for.
   * @returns A promise that resolves to an object containing the image URI and thumbnail URI, or null if the contact does not have an image.
   */
  getContactImage(contactId: string): Promise<{
    imageUri: string | null;
    thumbnailUri: string | null;
  }>;
  /**
   * Fetch merged contact data from multiple contact IDs. Does not mutate the contacts, just returns a new contact object.
   * @param fromContactIds An array of contact IDs to merge.
   * @returns A promise that resolves to a CNContactWithImageData object containing the merged contact data.
   */
  getMergedContact(fromContactIds: string[]): Promise<CNContactWithImageData>;
  /**
   * Merges multiple contacts into a single contact.
   * Actually performs the merge operation: it will delete the original contacts, create a new contact with the merged data, write the changes to the address book, and return new and deleted contacts.
   * @param fromContactIds An array of contact IDs to merge.
   * @returns A promise that resolves to an object containing the added contact and an array of deleted contacts.
   */
  mergeContacts(fromContactIds: string[]): Promise<{
    added: CNContactWithImageData;
    deleted: CNContactWithImageData[];
  }>;
  /**
   * Presents a contact picker to the user.
   * @param options Optional appearance settings for the contact picker.
   * @returns A promise that resolves to an array of CNContactWithImageData objects selected by the user.
   */
  presentContactPicker(options: {
    appearance?: Appearance;
  }): Promise<CNContactWithImageData[]>;
  /**
   * Deletes a contact from the address book by its identifier.
   * @param contactId The identifier of the contact to delete.
   * @returns A promise that resolves to an object containing the identifier of the deleted contact.
   */
  removeContact(contactId: string): Promise<{ identifier: string }>;
  /**
   * Saves a contacts from the address book as a private contact.
   * Does not mutate or delete the original contacts, just creates a new private contacts with the same data.
   * @param contactIds An array of contact IDs to save as private contacts.
   * @returns A promise that resolves to a CNContactWithImageData object containing the saved private contact.
   */
  saveContactsAsPrivate(contactIds: string[]): Promise<CNContactWithImageData[]>;
  /**
   * Fetches all private contacts.
   * @returns A promise that resolves to an array of CNContactWithImageData objects representing the private contacts.
   */
  fetchPrivateContacts(): Promise<CNContactWithImageData[]>;
  /**
   * Fetches a private contact by its identifier.
   * @param contactId The identifier of the private contact to fetch.
   * @returns A promise that resolves to a CNContactWithImageData object representing the private contact.
   */
  getPrivateContact(contactId: string): Promise<CNContactWithImageData>;
  /**
   * Deletes a private contact by its identifier.
   * @param contactId The identifier of the private contact to delete.
   * @returns A promise that resolves to an object containing the identifier of the deleted private contact.
   */
  deletePrivateContact(contactId: string): Promise<{ identifier: string }>;
  /**
   * Saves a private contact as a contact in the address book.
   * This will create a new contact with the same data as the private contact, and it will not mutate or delete the original private contact.
   * @param contactId The identifier of the private contact to save as a contact.
   * @returns A promise that resolves to a CNContactWithImageData object containing the saved private contact.
   */
  savePrivateAsContact(contactId: string): Promise<CNContactWithImageData>;
  /**
   * Presents a contact viewer for a specific contact. Pass either contactId or privateId to view address book or private contact respectively.
   * @param contactId The identifier of the address book contact to view.
   * @param privateId The identifier of the private contact to view.
   * @param appearance Optional appearance settings for the contact viewer, can be 'light' or 'dark'.
   * @param dismissButtonTitle Optional title for the dismiss button.
   * @param title Optional title for the contact viewer modal.
   */
  presentContactViewer(options: PresentContactViewerOptions): Promise<void>;
  /**
   * Presents a contacts editor for a private contact.
   * @param contactId The identifier of the private contact to edit. If not provided, a new contact editor will be presented.
   * @param appearance Optional appearance settings for the contacts editor, can be 'light' or 'dark'.
   * @param dismissButtonTitle Optional title for the dismiss button.
   * @param title Optional title for the contacts editor modal.
   * @return A promise that resolves to a CNContactWithImageData object representing the edited contact, or null if the user cancelled the editor.
   */
  presentContactsEditor(
    options: PresentContactsEditorOptions
  ): Promise<CNContactWithImageData | null>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ContactsKitModule>('ContactsKit');
