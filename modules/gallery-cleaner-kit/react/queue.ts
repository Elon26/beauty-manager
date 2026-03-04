// @ts-expect-error
import PQueue from 'p-queue/dist';

export const taskQueue = new PQueue({ concurrency: 1 });
