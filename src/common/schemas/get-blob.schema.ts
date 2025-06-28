import { Type } from '@sinclair/typebox';

import { ErrorSchema } from './error.schema.js';
import { HTTP_CODES } from '../http-codes.js';

export const GetBlobParamsSchema = Type.Object({
  id: Type.String(),
});

export const GetBlobSchema = {
  params: GetBlobParamsSchema,
  response: {
    [HTTP_CODES.OK]: Type.Any(),
    [HTTP_CODES.NOT_FOUND]: ErrorSchema,
  },
};
