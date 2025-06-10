import { Static } from '@sinclair/typebox';

import { ServerSchema } from './schemas/common.schema.js';

export type TServer = Static<typeof ServerSchema>;

export type TServerToAdd = Omit<TServer, 'id'>;
