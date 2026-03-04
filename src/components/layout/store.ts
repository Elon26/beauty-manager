import { createStoreWithProducer } from '@xstate/store';
import { produce } from 'immer';
import type { ReactNode } from 'react';

type HeaderRight = ReactNode;

export const headerLayoutStore = createStoreWithProducer(produce, {
  context: {
    headerRight: null as HeaderRight,
  },
  on: {
    setHeaderRight: (ctx, e: { headerRight: HeaderRight }) => {
      ctx.headerRight = e.headerRight;
    },
  },
});
