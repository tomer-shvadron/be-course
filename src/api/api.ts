import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { BlobsRoutes } from './routes/blobs/blobs.route.js';
import { ApiConfig } from './api.config.js';
import { ensureBlobsDirectory } from './routes/blobs/blobs.utils.js';

const api = Fastify({
  logger: true,
  disableRequestLogging: true,
  bodyLimit: ApiConfig.MAX_LENGTH,
}).withTypeProvider<TypeBoxTypeProvider>();

api.addContentTypeParser(
  ['image/jpeg', 'image/png', 'text/plain'],
  { parseAs: 'buffer' },
  (_, body, done) => {
    done(null, body);
  }
);

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
