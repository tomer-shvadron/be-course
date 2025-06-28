import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { HTTP_CODES } from '../../common/http-codes.js';
import { CreateUserSchema } from './schemas/create-user.schema.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { GetUserByEmailSchema } from './schemas/get-user-by-email.schema.js';
import { DeleteUserByEmailSchema } from './schemas/delete-user-by-email.schema.js';

export const UsersRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'POST',
    url: '/users',
    schema: CreateUserSchema,
    handler: async (request, reply) => {
      try {
        await UsersRepository.createUser(request.body);

        return await reply.status(HTTP_CODES.CREATED).send();
      } catch (error) {
        console.error('Error in user creation', { cause: error });

        throw error;
      }
    },
  });

  app.route({
    method: 'GET',
    url: '/users/:email',
    schema: GetUserByEmailSchema,
    handler: async (request, reply) => {
      try {
        const user = await UsersRepository.getUserByEmail(request.params.email);

        return await reply.status(HTTP_CODES.OK).send(user);
      } catch (error) {
        console.error('Error in user retrieval', { cause: error });

        throw error;
      }
    },
  });

  app.route({
    method: 'DELETE',
    url: '/users/:email',
    schema: DeleteUserByEmailSchema,
    handler: async (request, reply) => {
      try {
        await UsersRepository.softDeleteUser(request.params.email);

        return await reply.status(HTTP_CODES.NO_CONTENT).send();
      } catch (error) {
        console.error('Error in user deletion', { cause: error });

        throw error;
      }
    },
  });
};
