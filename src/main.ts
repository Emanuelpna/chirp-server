import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';

import { chirpRoutes } from './routes/chirps';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCors);

fastify.register(chirpRoutes);

fastify.get('/', async () => {
  return { message: 'hello world' };
});

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
