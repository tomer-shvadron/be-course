import { Type } from '@sinclair/typebox';

export const GetBlobParamsSchema = Type.Object({
  id: Type.String(),
});

export const GetBlobSchema = {
  params: GetBlobParamsSchema,
  response: {
    200: Type.Any(),
  },
};
