import {
  FastifyPluginAsyncTypebox,
  TypeBoxTypeProvider,
} from '@fastify/type-provider-typebox';
import { FastifyRequest } from 'fastify';

import { CreateBlobSchema } from '../../../common/schemas/create-blob.schema.js';
import { GetBlobSchema } from '../../../common/schemas/get-blob.schema.js';
import { DeleteBlobSchema } from '../../../common/schemas/delete-blob.schema.js';
import { BlobsRepository } from '../../repositories/blobs.repository.js';
import { getRelevantHeaders, validateBlobRequest } from './blobs.utils.js';

type CreateBlobRequest = FastifyRequest<
  {
    Params: typeof CreateBlobSchema.params;
    Body: undefined;
  } & TypeBoxTypeProvider
>;

export const BlobsRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'POST',
    url: '/blobs/:id',
    schema: {
      ...CreateBlobSchema,
      body: undefined,
    },
    handler: async (request: CreateBlobRequest) => {
      try {
        await validateBlobRequest(request);

        const headers = getRelevantHeaders(request.headers);
        const stream = request.raw;

        if (!stream) {
          throw new Error('Request stream is not available');
        }

        await BlobsRepository.create({
          id: request.params.id,
          stream,
          headers,
        });

        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error in blob upload:', error);

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
          message: `Blob with id ${id} was not found`,
        });
      }

      const { stream, headers } = result;

      for (const [key, value] of Object.entries(headers)) {
        reply.header(key, value);
      }

      if (!headers['content-type']) {
        reply.header('content-type', 'application/octet-stream');
      }

      return reply.send(stream);
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
