import { TServer } from '../routes/nodes/types.js';

const servers: TServer[] = [
  {
    id: '1',
    name: 'node-1',
    destination: {
      host: 'localhost',
      port: 21494,
    },
  },
  {
    id: '2',
    name: 'node-2',
    destination: {
      host: 'localhost',
      port: 21495,
    },
  },
];

export const ServerRepository = {
  getAll: () => {
    return servers;
  },
  findById: (id: string) => {
    const server = servers.find((server) => server.id === id);

    if (!server) {
      throw new Error(`Server with id ${id} was not found`);
    }

    return { ...server };
  },
  findByDestination: (destination: TServer['destination']) => {
    return servers.find(
      (server) =>
        server.destination.host === destination.host &&
        server.destination.port === destination.port
    );
  },
  add: (server: TServer) => {
    servers.push(server);

    return server.id;
  },
  updateById: (id: string, server: TServer) => {
    const index = servers.findIndex((server) => server.id === id);

    if (index === -1) {
      throw new Error(`Server with id ${id} was not found`);
    }

    servers[index] = server;
  },
};
