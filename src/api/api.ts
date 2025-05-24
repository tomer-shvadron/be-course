import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { IncomingMessage } from 'http';
import { Buffer } from 'buffer';
import { FastifyRequest } from 'fastify';

import { BlobsRoutes } from './routes/blobs/blobs.route.js';
import { ApiConfig } from './api.config.js';
import { ensureBlobsDirectory } from './routes/blobs/blobs.utils.js';

const api = Fastify({
  logger: true,
  disableRequestLogging: true,
  bodyLimit: ApiConfig.MAX_LENGTH,
}).withTypeProvider<TypeBoxTypeProvider>();

api.removeAllContentTypeParsers();

api.addContentTypeParser(
  '*',
  async function (request: FastifyRequest, payload: IncomingMessage) {
    if (request.url.startsWith('/blobs/') && request.method === 'POST') {
      return undefined;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      payload.on('data', (chunk) => chunks.push(chunk));

      payload.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve(body);
      });

      payload.on('error', (err) => reject(err));
    });
  }
);

api.addHook('preHandler', (request, reply, done) => {
  if (request.url.startsWith('/blobs/') && request.method === 'POST') {
    if (!request.raw) {
      done(new Error('Raw request not available'));
      return;
    }

    if (request.raw.readableEnded) {
      done(new Error('Request body has already been consumed'));
      return;
    }
  }

  done();
});

api.register(BlobsRoutes);

api.setErrorHandler((error, _, reply) => {
  api.log.error(error);

  reply.status(500).send({
    error: 'Internal Server Error',
    message: error.message,
  });
});

const listen = async () => {
  try {
    await ensureBlobsDirectory();
    await api.listen({ port: 21494, host: 'localhost' });

    console.log('Server is running on http://localhost:21494');
  } catch (err) {
    api.log.error(err);

    process.exit(1);
  }
};

listen();
