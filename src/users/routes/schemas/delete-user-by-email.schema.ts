import { Type } from '@sinclair/typebox';

import { HTTP_CODES } from '../../../common/http-codes.js';

export const DeleteUserByEmailSchema = {
  params: Type.Object({
    email: Type.String({ format: 'email', maxLength: 200 }),
  }),
  response: {
    [HTTP_CODES.NO_CONTENT]: {},
    [HTTP_CODES.NOT_FOUND]: {},
  },
};
