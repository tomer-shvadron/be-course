import { Type } from '@sinclair/typebox';

import { ErrorSchema } from './error.schema.js';

export const GetBlobParamsSchema = Type.Object({
  id: Type.String(),
});

export const GetBlobSchema = {
  params: GetBlobParamsSchema,
  response: {
    200: Type.Any(),
    404: ErrorSchema,
  },
};
