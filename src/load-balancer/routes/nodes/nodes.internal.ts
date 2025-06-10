import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { AddNodeSchema } from './schemas/add-node.schema.js';
import { GetAllNodesSchema } from './schemas/get-all-nodes.schema.js';
import { ServerService } from '../../services/server.service.js';

export const NodesInternalRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'GET',
    url: '/internal/nodes',
    schema: GetAllNodesSchema,
    handler: async (_, res) => {
      const servers = ServerService.getAll();

      res.send({ data: servers });
    },
  });

  app.route({
    method: 'POST',
    url: '/internal/nodes',
    schema: AddNodeSchema,
    handler: async (req, res) => {
      const id = ServerService.add({
        ...req.body,
        name: req.body.name ?? null,
      });

      res.send({ id });
    },
  });
};
