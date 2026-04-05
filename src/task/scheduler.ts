import { defaultQueue } from '../lib/queue.js';
import { logger } from '../lib/logger.js';

const SCHEDULED_TASKS = {
  CleanupExpiredSessions: 'cleanup_expired_sessions',
};

const registerScheduledTasks = async () => {
  await defaultQueue.add(
    SCHEDULED_TASKS.CleanupExpiredSessions,
    {},
    {
      repeat: {
        pattern: '0 * * * *', // every hour
      },
    },
  );
  logger.info('Scheduled tasks registered');
};

export { SCHEDULED_TASKS, registerScheduledTasks };
