import { Type, Static } from '@sinclair/typebox';

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
    200: CreateBlobSuccessResponseSchema,
  },
  rawBody: true,
};
