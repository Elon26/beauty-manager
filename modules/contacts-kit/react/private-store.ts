import { createStore } from '@xstate/store';
import type { CNContactWithImageData } from '../src/ContactsKit.types';
import ContactsKitModule from '../src/ContactsKitModule';
import { type CnContactsStatus, CnContactsStatuses } from './constants';

export const privateContactsStore = createStore({
  context: {
    privateCnContactsStatus: CnContactsStatuses.idle as CnContactsStatus,
    privateCnContacts: {} as Record<string, CNContactWithImageData>,
    privateCnContactIds: [] as string[],
    pauseUpdates: false,
  },
  on: {
    FETCH: (context, _event, enqueue) => {
      enqueue.effect(async () => {
        const contacts = await ContactsKitModule.fetchPrivateContacts();
        privateContactsStore.send({ type: 'SET_CNCONTACTS', cnContacts: contacts });
      });
      return {
        ...context,
        privateCnContactsStatus: CnContactsStatuses.loading,
      };
    },
    SET_CNCONTACTS: (context, event: { cnContacts: CNContactWithImageData[] }) => {
      const newContacts: Record<string, CNContactWithImageData> = {};
      const newContactIds: string[] = [];

      for (const contact of event.cnContacts) {
        newContacts[contact.identifier] = contact;
        newContactIds.push(contact.identifier);
      }

      return {
        ...context,
        privateCnContacts: newContacts,
        privateCnContactIds: newContactIds,
        privateCnContactsStatus: CnContactsStatuses.fetched,
      };
    },
    CONTACTS_CHANGED: (context) => {
      if (context.pauseUpdates) {
        return context;
      }
      if (context.privateCnContactsStatus === CnContactsStatuses.fetched) {
        privateContactsStore.send({ type: 'FETCH' });
      }
    },
    PAUSE_UPDATES: (context) => {
      return {
        ...context,
        pauseUpdates: true,
      };
    },
    RESUME_UPDATES: (context) => {
      return {
        ...context,
        pauseUpdates: false,
      };
    },
  },
});

ContactsKitModule.addListener('onPrivateChange', () => {
  privateContactsStore.send({ type: 'CONTACTS_CHANGED' });
});
