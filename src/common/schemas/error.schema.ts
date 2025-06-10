import { Type } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  message: Type.String(),
  cause: Type.Optional(Type.Any()),
});
