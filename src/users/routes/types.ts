import { Static } from '@sinclair/typebox';

import { CreateUserBodySchema } from './schemas/create-user.schema.js';
import { GetUserByEmailResponseSchema } from './schemas/get-user-by-email.schema.js';

export type NewUser = Static<typeof CreateUserBodySchema>;

export type User = Static<typeof GetUserByEmailResponseSchema>;
