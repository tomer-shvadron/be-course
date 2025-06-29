import { Type } from '@sinclair/typebox';

import { HTTP_CODES } from '../../../common/http-codes.js';

export const GetUserByEmailResponseSchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 200 }),
  fullName: Type.String({ minLength: 1, maxLength: 100 }),
  joinedAt: Type.String({ format: 'date-time' }),
});

export const GetUserByEmailSchema = {
  params: Type.Object({
    email: Type.String({ format: 'email', maxLength: 200 }),
  }),
  response: {
    [HTTP_CODES.OK]: GetUserByEmailResponseSchema,
  },
};
