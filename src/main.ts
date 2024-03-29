import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';

import { chirpRoutes } from './routes/chirps.route';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCors, {
  origin: process.env.CLIENT_URL ?? '*',
  methods: ['GET', 'PUT', 'POST'],
});

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
      host: process.env.HOST ?? '127.0.0.1',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
