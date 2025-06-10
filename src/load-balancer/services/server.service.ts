import { createHash } from 'crypto';

import { TServerToAdd } from '../routes/nodes/types.js';
import { ServerRepository } from '../repositories/server.repository.js';

export const ServerService = {
  getAll: () => {
    return ServerRepository.getAll();
  },
  get: (id: string) => {
    return ServerRepository.findById(id);
  },
  add: (server: TServerToAdd) => {
    const id = createId(server.name);

    const existingServer = ServerRepository.findByDestination(
      server.destination
    );

    if (existingServer) {
      ServerRepository.updateById(existingServer.id, {
        ...existingServer,
        name: server.name,
      });

      return existingServer.id;
    }

    return ServerRepository.add({
      ...server,
      id,
    });
  },
};

const createId = (url: string | null) => {
  return createHash('sha256')
    .update(url ?? '')
    .digest('hex');
};
