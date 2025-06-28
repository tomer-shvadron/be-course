import { Type } from '@sinclair/typebox';

import { HTTP_CODES } from '../../../common/http-codes.js';

export const CreateUserBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 200 }),
  fullName: Type.String({ minLength: 1, maxLength: 100 }),
});

export const CreateUserSchema = {
  body: CreateUserBodySchema,
  response: {
    [HTTP_CODES.CREATED]: {},
  },
};
