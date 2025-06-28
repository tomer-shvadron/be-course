import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { config } from '../common/config.js';
import { initServer } from '../common/init-server.js';
import { UsersRoutes } from './routes/users.route.js';

const api = Fastify({
  logger: true,
  disableRequestLogging: true,
  bodyLimit: config.API.MAX_LENGTH,
}).withTypeProvider<TypeBoxTypeProvider>();

initServer(api);

api.register(UsersRoutes);

const listen = async () => {
  try {
    const { PORT, HOST } = config.USERS;

    await api.listen({
      port: PORT,
      host: HOST,
    });

    console.log(`Users Microservice is running on http://${HOST}:${PORT}`);
  } catch (err) {
    api.log.error(err);

    process.exit(1);
  }
};

listen();
