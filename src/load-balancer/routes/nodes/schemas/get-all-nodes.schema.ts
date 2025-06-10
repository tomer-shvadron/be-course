import { Type } from '@sinclair/typebox';

import { HTTP_CODES } from '../../../../common/http-codes.js';
import { ServerSchema } from './common.schema.js';

const GetAllNodesSuccessSchema = Type.Object({
  data: Type.Array(ServerSchema),
});

export const GetAllNodesSchema = {
  response: {
    [HTTP_CODES.OK]: GetAllNodesSuccessSchema,
  },
};
