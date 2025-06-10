import { Buffer } from 'buffer';
import { IncomingMessage } from 'http';
import { FastifyInstance, FastifyRequest } from 'fastify';

export const initServer = (api: FastifyInstance) => {
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

          // Check if this is a JSON request
          const contentType = request.headers['content-type'];
          if (contentType && contentType.includes('application/json')) {
            try {
              const jsonBody = JSON.parse(body.toString('utf8'));
              resolve(jsonBody);
            } catch (error) {
              reject(
                new Error(
                  `Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
              );
            }
          } else {
            resolve(body);
          }
        });

        payload.on('error', (err) => reject(err));
      });
    }
  );

  api.addHook('preHandler', (request, _, done) => {
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

  api.setErrorHandler((error, _, reply) => {
    api.log.error(error);

    return reply.status(500).send({
      error: 'Internal Server Error',
      message: error.message,
    });
  });
};
