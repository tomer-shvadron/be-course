import { Type } from '@sinclair/typebox';

import { HTTP_CODES } from '../http-codes.js';

export const DeleteBlobParamsSchema = Type.Object({
  id: Type.String(),
});

export const DeleteBlobSuccessResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
});

export const DeleteBlobSchema = {
  params: DeleteBlobParamsSchema,
  response: {
    [HTTP_CODES.OK]: DeleteBlobSuccessResponseSchema,
  },
};
