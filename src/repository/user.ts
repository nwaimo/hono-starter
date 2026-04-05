import { count, eq } from 'drizzle-orm';
import { userSchema } from '../db/schema/schema.js';
import { db, type NewUser } from '../db/database.js';

export class UserRepository {
  public async create(user: NewUser) {
    return db.insert(userSchema).values(user);
  }

  public async find(id: number) {
    return db.query.userSchema.findFirst({
      where: eq(userSchema.id, id),
    });
  }

  public async findByEmail(email: string) {
    return db.query.userSchema.findFirst({
      where: eq(userSchema.email, email),
    });
  }

  public async findAll(limit: number, offset: number) {
    const [users, total] = await Promise.all([
      db.select().from(userSchema).limit(limit).offset(offset),
      db.select({ count: count() }).from(userSchema),
    ]);
    return { users, total: total[0].count };
  }
}
