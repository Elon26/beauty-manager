import { createStore } from '@xstate/store';

import type { CNContact } from '../src/ContactsKit.types';
import ContactsKitModule from '../src/ContactsKitModule';
import {
  type CnContactsStatus,
  CnContactsStatuses,
  type SimilarityField,
  SimilarityFields,
} from './constants';

export const store = createStore({
  context: {
    cnContactsStatus: CnContactsStatuses.idle as CnContactsStatus,
    cnContacts: {} as Record<string, CNContact>,
    cnContactIds: [] as string[],
    similarGroups: {
      name: {
        idGroups: [],
        status: CnContactsStatuses.idle,
      },
      phone: {
        idGroups: [] as string[][],
        status: CnContactsStatuses.idle,
      },
      any: {
        idGroups: [] as string[][],
        status: CnContactsStatuses.idle,
      },
    } as Record<
      SimilarityField,
      {
        idGroups: string[][];
        status: CnContactsStatus;
      }
    >,
    incomplete: {
      ids: [] as string[],
      status: CnContactsStatuses.idle as CnContactsStatus,
    },
    pauseUpdates: false,
  },
  on: {
    FETCH: (context, _event, enqueue) => {
      enqueue.effect(async () => {
        const contacts = await ContactsKitModule.fetchContacts();
        store.send({ type: 'SET_CNCONTACTS', cnContacts: contacts });
      });
      return {
        ...context,
        cnContactsStatus: CnContactsStatuses.loading,
      };
    },
    SET_CNCONTACTS: (context, event: { cnContacts: CNContact[] }) => {
      const newContacts: Record<string, CNContact> = {};
      const newContactIds: string[] = [];

      for (const contact of event.cnContacts) {
        newContacts[contact.identifier] = contact;
        newContactIds.push(contact.identifier);
      }

      return {
        ...context,
        cnContacts: newContacts,
        cnContactIds: newContactIds,
        cnContactsStatus: CnContactsStatuses.fetched,
      };
    },
    FETCH_SIMILAR: (context, event: { field: SimilarityField }, enqueue) => {
      const field = event.field;
      enqueue.effect(async () => {
        let groups: CNContact[][] = [];
        switch (field) {
          case SimilarityFields.name:
            groups = await ContactsKitModule.getSimilarByName(0.9, 'hybrid');
            break;
          case SimilarityFields.phone:
            groups = await ContactsKitModule.getSimilarByPhoneNumber(6);
            break;
          case SimilarityFields.any:
            groups = await ContactsKitModule.getSimilarByNameOrPhone(
              0.9,
              'hybrid',
              6
            );
            break;
          default:
            throw new Error(`Unknown similarity field: ${field}`);
        }
        store.send({ type: 'SET_SIMILAR_GROUPS', field, groups });
      });
      return {
        ...context,
        similarGroups: {
          ...context.similarGroups,
          [field]: {
            ...context.similarGroups[field],
            status: CnContactsStatuses.loading,
          },
        },
      };
    },
    SET_SIMILAR_GROUPS: (
      context,
      event: { field: SimilarityField; groups: CNContact[][] }
    ) => {
      const newCnContacts = {} as Record<string, CNContact>;
      for (const contact of event.groups.flat()) {
        newCnContacts[contact.identifier] = contact;
      }

      return {
        ...context,
        cnContacts: {
          ...context.cnContacts,
          ...newCnContacts,
        },
        similarGroups: {
          ...context.similarGroups,
          [event.field]: {
            idGroups: event.groups.map((group) =>
              group.map((c) => c.identifier)
            ),
            status: CnContactsStatuses.fetched,
          },
        },
      };
    },
    FETCH_INCOMPLETE: (context, _, enqueue) => {
      enqueue.effect(async () => {
        const contacts = await ContactsKitModule.fetchIncompleteContacts();
        store.send({
          type: 'SET_INCOMPLETE',
          contacts,
        });
      });
      return {
        ...context,
        incomplete: {
          ...context.incomplete,
          status: CnContactsStatuses.loading,
        },
      };
    },
    SET_INCOMPLETE: (context, event: { contacts: CNContact[] }) => {
      const newCnContacts = {} as Record<string, CNContact>;
      for (const contact of event.contacts) {
        newCnContacts[contact.identifier] = contact;
      }
      return {
        ...context,
        incomplete: {
          ...context.incomplete,
          status: CnContactsStatuses.fetched,
          ids: event.contacts.map((contact) => contact.identifier),
        },
      };
    },
    CONTACTS_CHANGED: (context) => {
      if (context.pauseUpdates) {
        return context;
      }
      if (context.cnContactsStatus === CnContactsStatuses.fetched) {
        store.send({ type: 'FETCH' });
      }
      for (const field of Object.values(SimilarityFields)) {
        if (
          context.similarGroups[field].status === CnContactsStatuses.fetched
        ) {
          store.send({ type: 'FETCH_SIMILAR', field });
        }
      }
      if (context.incomplete.status === CnContactsStatuses.fetched) {
        store.send({ type: 'FETCH_INCOMPLETE' });
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

ContactsKitModule.addListener('onContactsChange', () => {
  store.send({ type: 'CONTACTS_CHANGED' });
});
