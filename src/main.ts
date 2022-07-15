import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';

import { chirpRoutes } from './routes/chirps.route';

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
    await fastify.listen({
      port: process.env.PORT || 4000,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
