import { hash } from '../lib/encryption.js';
import { db } from './database.js';
import { userSchema } from './schema/schema.js';

const seed = async () => {
  console.log('Seeding database...');

  const password = await hash('password123');

  await db
    .insert(userSchema)
    .values([
      { name: 'John Doe', email: 'john@example.com', password },
      { name: 'Jane Smith', email: 'jane@example.com', password },
    ])
    .onConflictDoNothing();

  console.log('Seeding complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
