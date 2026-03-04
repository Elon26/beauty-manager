import { useSelector } from '@xstate/store/react';
import { useCallback, useMemo } from 'react';
import { selectedContactsAtom, selectionModeAtom } from './atom';

export function useSelectedContacts(contactIdsFlat: string[] = []) {
  const selectedContacts = useSelector(selectedContactsAtom, (state) => state);
  const setSelectedContacts = selectedContactsAtom.set;
  const selectionMode = useSelector(selectionModeAtom, (state) => state);
  const setSelectionMode = selectionModeAtom.set;

  const selectedContactsAsArray = useMemo(() => Array.from(selectedContacts), [selectedContacts]);

  const handleContactSelect = useCallback(
    (id: string) => {
      setSelectedContacts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    [setSelectedContacts]
  );

  const isContactSelected = useCallback(
    (id: string) => selectedContacts.has(id),
    [selectedContacts]
  );

  const selectAllContacts = useCallback(() => {
    setSelectedContacts(new Set(contactIdsFlat));
  }, [contactIdsFlat, setSelectedContacts]);

  const deselectAllContacts = useCallback(() => {
    setSelectedContacts(new Set<string>());
  }, [setSelectedContacts]);

  const isAllSelected =
    contactIdsFlat.length > 0 && selectedContacts.size === contactIdsFlat.length;

  return {
    selectedContacts,
    handleContactSelect,
    isContactSelected,
    selectAllContacts,
    deselectAllContacts,
    isAllSelected,
    setSelectedContacts,
    selectionMode,
    setSelectionMode,
    isNoneSelected: selectedContacts.size === 0,
    selectedContactsAsArray,
  };
}
