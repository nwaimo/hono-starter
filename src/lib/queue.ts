import { Queue } from 'bullmq';
import { redis } from './redis.js';

const QUEUE = {
  default: 'default',
};

// Reuse the shared redis instance
const connection = redis;
const defaultQueue = new Queue(QUEUE.default, {
  connection,
  defaultJobOptions: {
    removeOnComplete: {
      count: 1000, // keep up to 1000 jobs
      age: 24 * 3600, // keep up to 24 hours
    },
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
  },
});

export { connection, defaultQueue, QUEUE };
