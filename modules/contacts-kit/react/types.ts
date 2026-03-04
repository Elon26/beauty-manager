import type { CNContact } from '../index';

export type RContact = CNContact & {
  image: {
    full: string | null | undefined;
    thumbnail: string | null | undefined;
  };
  displayName: string;
};
