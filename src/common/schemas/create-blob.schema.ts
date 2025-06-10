import { Type, Static } from '@sinclair/typebox';

import { HTTP_CODES } from '../http-codes.js';
import { ErrorSchema } from './error.schema.js';

export const CreateBlobParamsSchema = Type.Object({
  id: Type.String(),
});

export type TCreateBlobParams = Static<typeof CreateBlobParamsSchema>;

export const CreateBlobBodySchema = Type.Any();

export const CreateBlobSuccessResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
});

export const CreateBlobSchema = {
  params: CreateBlobParamsSchema,
  body: CreateBlobBodySchema,
  response: {
    [HTTP_CODES.OK]: CreateBlobSuccessResponseSchema,
    [HTTP_CODES.INTERNAL_SERVER_ERROR]: ErrorSchema,
  },
  rawBody: true,
};
