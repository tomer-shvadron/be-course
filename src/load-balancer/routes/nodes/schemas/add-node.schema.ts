import { Type } from '@sinclair/typebox';

import { HTTP_CODES } from '../../../../common/http-codes.js';
import { ServerSchema } from './common.schema.js';

const AddNodeBodySchema = Type.Object({
  destination: ServerSchema.properties.destination,
  name: Type.Optional(ServerSchema.properties.name),
});

const AddNodeSuccessResponseSchema = Type.Object({
  id: Type.String(),
});

const AddNodeFailureResponseSchema = Type.Object({
  errorMessage: Type.String(),
});

const AddNodeForbiddenResponseSchema = Type.Object({
  errorMessage: Type.Literal(
    'The request was rejected because registration period is over'
  ),
});

export const AddNodeSchema = {
  body: AddNodeBodySchema,
  response: {
    [HTTP_CODES.OK]: AddNodeSuccessResponseSchema,
    [HTTP_CODES.FORBIDDEN]: AddNodeForbiddenResponseSchema,
    [HTTP_CODES.BAD_REQUEST]: AddNodeFailureResponseSchema,
  },
};
