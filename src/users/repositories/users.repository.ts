import z from 'zod';
import { v7 as uuidv7 } from 'uuid';

import { db } from '../db.js';
import { logger } from '../../common/logger.js';
import { NewUser, User } from '../routes/types.js';

const createUserCommandResultSchema = z.object({
  id: z.string().uuid(),
  is_inserted: z.boolean(),
  is_updated: z.boolean(),
  was_reactivated: z.union([z.boolean(), z.null()]),
});

const userSchema = z
  .object({
    email: z.string().email(),
    full_name: z.string(),
    joined_at: z.date(),
  })
  .transform((data) => ({
    email: data.email,
    fullName: data.full_name,
    joinedAt:
      data.joined_at instanceof Date
        ? data.joined_at.toISOString()
        : data.joined_at,
  }));

export const UsersRepository = {
  createUser: async (user: NewUser): Promise<void> => {
    const { email, fullName } = user;

    const query = `
        WITH existing_user AS (
            SELECT deleted_since as previous_deleted_since
            FROM users 
            WHERE email = $2
        )
        INSERT INTO users (id, email, full_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET 
            full_name = EXCLUDED.full_name,
            deleted_since = NULL
        RETURNING 
            id, 
            (xmax = 0) as is_inserted, 
            (xmax != 0) as is_updated,
            (SELECT (xmax != 0 AND previous_deleted_since IS NOT NULL) FROM existing_user) as was_reactivated
    `;

    const result = await db.query(query, [uuidv7(), email, fullName]);

    if (result.rows.length === 0) {
      logger.error('Failed to create user');
      throw new Error('Failed to create user');
    }

    const commandResult = createUserCommandResultSchema.safeParse(
      result.rows[0]
    );

    if (!commandResult.success) {
      logger.error('Failed to parse command result', {
        cause: commandResult.error,
      });

      throw new Error('Failed to parse command result', {
        cause: commandResult.error,
      });
    }

    const { id, is_inserted, is_updated, was_reactivated } = commandResult.data;

    if (was_reactivated) {
      logger.info('User was reactivated', { email, id });
    } else if (is_inserted) {
      logger.info('User was created', { email, id });
    } else if (is_updated) {
      logger.info('User was updated', { email, id });
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    const query = `
        SELECT email, full_name, joined_at
        FROM users 
        WHERE email = $1 AND deleted_since IS NULL
    `;

    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = userSchema.safeParse(result.rows[0]);

    if (!user.success) {
      logger.error('Failed to parse user', {
        cause: user.error,
      });
      throw new Error('Failed to parse user', {
        cause: user.error,
      });
    }

    return user.data;
  },

  softDeleteUser: async (email: string): Promise<void> => {
    const query = `
        UPDATE users 
        SET deleted_since = NOW()
        WHERE email = $1 AND deleted_since IS NULL
    `;

    const result = await db.query(query, [email]);

    if (result.rowCount === 0) {
      logger.warn('User not found', { email });
    } else {
      logger.info('User soft deleted', { email });
    }
  },
};
