import invariant from 'tiny-invariant';
import { FastifyInstance } from 'fastify';

import { ChirpDTOCreate } from '../domain/chirp/chirp.dto';

import { ChirpController } from '../data/controllers/chirp.controller';
import { ChirpRepository } from '../data/repositories/chirp.repository';

const ROUTE_BASE = 'chirps';

export async function chirpRoutes(fastify: FastifyInstance) {
  const chirpRepository = new ChirpRepository();

  fastify.get(`/${ROUTE_BASE}`, async (request, reply) => {
    try {
      const chirps = await chirpRepository.getChirps();

      const rechirpIds = chirps
        .filter((chirp) => chirp.isRechirp)
        .map((chirp) => chirp.id);

      const rechirps = await chirpRepository.getBulkChirpsByIds(rechirpIds);

      const items =
        rechirps.length > 0
          ? chirps.map((chirp) => {
              const rechirp = chirps.find(
                (rechirp) => rechirp.id === chirp.parentToId,
              );

              if (!rechirp) return chirp;

              return {
                ...rechirp,
                reChirped: chirp,
              };
            })
          : chirps;

      reply.code(200).send({ items });
    } catch (err) {
      const error = err as Error;

      reply.code(422).send({
        name: error.name,
        error: error.message,
      });
    }
  });

  fastify.get<{ Querystring: { chirpId: number; authorId: number } }>(
    `/${ROUTE_BASE}/tree`,
    async (request, reply) => {
      try {
        const chirpId = Number(request.query.chirpId);
        const authorId = Number(request.query.authorId);

        invariant(
          chirpId && typeof chirpId === 'number',
          'A valid chirpID must be passed',
        );

        invariant(
          authorId && typeof authorId === 'number',
          'A valid authorId must be passed',
        );

        const chirpController = new ChirpController(chirpRepository);

        const response = await chirpController.getChirpThread(
          chirpId,
          authorId,
        );

        reply.code(200).send(response);
      } catch (err) {
        const error = err as Error;

        reply.code(422).send({
          name: error.name,
          error: error.message,
        });
      }
    },
  );

  const PostChirpLikeBody = {
    type: 'object',
    properties: {
      chirpId: { type: 'number' },
    },
  };

  fastify.put<{ Querystring: { chirpId: number } }>(
    `/${ROUTE_BASE}/like`,
    {
      schema: { body: PostChirpLikeBody },
    },
    async (request, reply) => {
      try {
        const { chirpId } = request.body as { chirpId: number };

        invariant(chirpId, 'chirpID not found');

        invariant(
          typeof chirpId === 'number',
          'chirpID must be a valid number id',
        );

        const payload = await chirpRepository.updateChirpLikes(chirpId);

        reply.code(200).send({ payload });
      } catch (err) {
        const error = err as Error;

        reply.code(422).send({
          name: error.name,
          error: error.message,
        });
      }
    },
  );

  const PostReChirpBody = {
    type: 'object',
    required: ['authorId', 'published', 'isRechirp', 'parentToId'],
    properties: {
      likes: { type: 'integer' },
      content: { type: 'string' },
      authorId: { type: 'integer' },
      published: { type: 'boolean' },
      isRechirp: { type: 'boolean' },
      parentToId: { type: 'integer' },
    },
  };

  fastify.post(
    `/${ROUTE_BASE}/rechirp`,
    { schema: { body: PostReChirpBody } },
    async (request, reply) => {
      try {
        const payload = request.body as ChirpDTOCreate;

        invariant(payload, 'payload not found');

        chirpRepository.createNewChirp(payload);

        reply.code(201).send({ payload });
      } catch (err) {
        const error = err as Error;

        reply.code(422).send({
          name: error.name,
          error: error.message,
        });
      }
    },
  );

  const PostChirpBody = {
    type: 'object',
    required: ['authorId', 'published', 'isRechirp'],
    properties: {
      content: { type: 'string' },
      published: { type: 'boolean' },
      isRechirp: { type: 'boolean' },
      likes: { type: 'integer' },
      authorId: { type: 'integer' },
      scheduledTo: { type: 'string' },
      parentToId: { type: 'integer' },
    },
  };

  fastify.post(
    `/${ROUTE_BASE}`,
    { schema: { body: PostChirpBody } },
    async (request, reply) => {
      try {
        const payload = request.body as ChirpDTOCreate;

        invariant(payload, 'payload not found');

        chirpRepository.createNewChirp(payload);

        reply.code(201).send({ payload });
      } catch (err) {
        const error = err as Error;

        reply.code(422).send({
          name: error.name,
          error: error.message,
        });
      }
    },
  );
}
