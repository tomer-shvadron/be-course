import { Buffer } from 'buffer';
import axios, { AxiosError } from 'axios';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { TServer } from '../nodes/types.js';
import { ServerRepository } from '../../repositories/server.repository.js';
import { GetBlobSchema } from '../../../common/schemas/get-blob.schema.js';
import { CreateBlobSchema } from '../../../common/schemas/create-blob.schema.js';
import { DeleteBlobSchema } from '../../../common/schemas/delete-blob.schema.js';

export const MainRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'GET',
    url: '/blobs/:id',
    schema: GetBlobSchema,
    handler: async (req, res) => {
      try {
        const server = ServerRepository.findById(req.params.id);

        const response = await axios.get(buildUrl(server, req.params.id), {
          responseType: 'arraybuffer',
        });

        Object.entries(response.headers).forEach(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            res.header(key, value);
          }
        });

        res.status(200).send(Buffer.from(response.data));
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          if (error.code === 'ECONNREFUSED') {
            return res.status(500).send(createError(error));
          }

          return res.status(error.response.status).send(error.response.data);
        } else {
          return res.status(500).send(createError(error));
        }
      }
    },
  });

  app.route({
    method: 'POST',
    url: '/blobs/:id',
    schema: CreateBlobSchema,
    handler: async (req, res) => {
      const server = ServerRepository.findById(req.params.id);

      const response = await axios.post(buildUrl(server, req.params.id), {
        data: req.body,
      });

      res.send(response.data);
    },
  });

  app.route({
    method: 'DELETE',
    url: '/blobs/:id',
    schema: DeleteBlobSchema,
    handler: async (req, res) => {
      const server = ServerRepository.findById(req.params.id);

      const response = await axios.delete(buildUrl(server, req.params.id));

      res.send(response.data);
    },
  });
};

const buildUrl = (server: TServer, id: string) => {
  return `${server.destination.host}:${server.destination.port}/blobs/${id}`;
};

const createError = (error: unknown) => {
  return {
    message: 'Failed to connect to blobs server',
    cause: { error },
  };
};
