import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { config } from '../common/config.js';
import { initServer } from '../common/init-server.js';
import { BlobsRoutes } from './routes/blobs/blobs.route.js';
import { ensureBlobsDirectory } from './routes/blobs/blobs.utils.js';

const api = Fastify({
  logger: true,
  disableRequestLogging: true,
  bodyLimit: config.API.MAX_LENGTH,
}).withTypeProvider<TypeBoxTypeProvider>();

initServer(api);

api.register(BlobsRoutes);

const listen = async () => {
  try {
    await ensureBlobsDirectory();

    const { PORT, HOST } = config.API;

    await api.listen({
      port: PORT,
      host: HOST,
    });

    console.log(`Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    api.log.error(err);

    process.exit(1);
  }
};

listen();
