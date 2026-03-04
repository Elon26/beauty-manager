import { createAtom } from '@xstate/store';

export const selectedContactsAtom = createAtom<Set<string>>(new Set<string>());
export const selectionModeAtom = createAtom(false);
