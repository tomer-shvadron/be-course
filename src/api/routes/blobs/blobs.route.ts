import { Buffer } from 'buffer';
import {
  FastifyPluginAsyncTypebox,
  TypeBoxTypeProvider,
} from '@fastify/type-provider-typebox';
import { FastifyRequest } from 'fastify';

import { CreateBlobSchema } from './schemas/create-blob.schema.js';
import { GetBlobSchema } from './schemas/get-blob.schema.js';
import { DeleteBlobSchema } from './schemas/delete-blob.schema.js';
import { BlobsRepository } from '../../repositories/blobs.repository.js';
import { getRelevantHeaders, validateBlobRequest } from './blobs.utils.js';

type CreateBlobRequest = FastifyRequest<
  {
    Params: typeof CreateBlobSchema.params;
    Body: typeof CreateBlobSchema.body;
  } & TypeBoxTypeProvider
>;

export const BlobsRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'POST',
    url: '/blobs/:id',
    schema: CreateBlobSchema,
    handler: async (request: CreateBlobRequest) => {
      try {
        await validateBlobRequest(request);

        const headers = getRelevantHeaders(request.headers);

        const buffer = request.body as unknown as Buffer;

        await BlobsRepository.create({
          id: request.params.id,
          buffer,
          headers,
        });

        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  app.route({
    method: 'GET',
    url: '/blobs/:id',
    schema: GetBlobSchema,
    handler: async (request, reply) => {
      const { id } = request.params;

      const result = await BlobsRepository.findById(id);

      if (!result) {
        return reply.status(404).send({
          error: 'Blob not found',
          message: `Blob with id ${id} was not found`,
        });
      }

      const { buffer, headers } = result;

      for (const [key, value] of Object.entries(headers)) {
        reply.header(key, value);
      }

      if (!headers['content-type']) {
        reply.header('content-type', 'application/octet-stream');
      }

      reply.send(buffer);

      return reply;
    },
  });

  app.route({
    method: 'DELETE',
    url: '/blobs/:id',
    schema: DeleteBlobSchema,
    handler: async (request) => {
      const { id } = request.params;

      await BlobsRepository.delete(id);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    },
  });
};
