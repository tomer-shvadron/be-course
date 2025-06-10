import { Type } from '@sinclair/typebox';

const validStringPattern = '^[a-zA-Z0-9-_]+$';

export const ServerSchema = Type.Object({
  id: Type.String({ pattern: validStringPattern }),
  name: Type.Union([Type.String({ pattern: validStringPattern }), Type.Null()]),
  destination: Type.Object({
    host: Type.String({
      pattern:
        '^https?://(?:[a-zA-Z0-9-._]+|localhost|\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::\\d+)?(?:/.*)?$',
    }),
    port: Type.Number({ minimum: 1, maximum: 65535 }),
  }),
});
