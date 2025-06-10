import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { config } from '../common/config.js';
import { logger } from '../common/logger.js';
import { initServer } from '../common/init-server.js';
import { MainRoute } from './routes/main/main.route.js';
import { NodesInternalRoute } from './routes/nodes/nodes.internal.js';

const api = Fastify({
  logger: true,
  disableRequestLogging: true,
  bodyLimit: config.API.MAX_LENGTH,
}).withTypeProvider<TypeBoxTypeProvider>();

initServer(api);

api.register(MainRoute);
api.register(NodesInternalRoute);

const listen = async () => {
  try {
    const { PORT, HOST } = config.LOAD_BALANCER;

    await api.listen({
      port: PORT,
      host: HOST,
    });

    logger.info(`Load Balancer is running on http://${HOST}:${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listen();
