import invariant from 'tiny-invariant';
import { FastifyInstance, RouteOptions } from 'fastify';

import { DistinctArray } from '../utils/array';

import { ChirpRepository } from '../repositories/chirp.repository';

import { ChirpDTO, ChirpWithAuhtor } from '../domain/chirp/chirp.dto';

const ROUTE_BASE = 'chirps';

export async function chirpRoutes(
  fastify: FastifyInstance,
  options: RouteOptions,
) {
  const chirpRepository = new ChirpRepository();

  fastify.get(`/${ROUTE_BASE}`, async (request, reply) => {
    const chirps = await chirpRepository.getChirps();

    reply.code(200).send({ items: chirps });
  });

  fastify.get<{ Querystring: { chirpId: number } }>(
    `/${ROUTE_BASE}/tree`,
    async (request, reply) => {
      try {
        const chirpId = Number(request.query.chirpId);

        invariant(chirpId, 'chirpID not found');

        invariant(
          typeof chirpId === 'number',
          'chirpID must be a valid number id',
        );

        const chirpDetails = await chirpRepository.getChirpDetails(chirpId);

        invariant(chirpDetails, 'Chirp not found');

        const threadChirps = await chirpRepository.getChirpThread(
          chirpDetails.author.id,
          chirpId,
        );

        const chirpThread = threadChirps?.[0].thread;

        const threadChirpsWithAuhor = chirpThread
          ? await chirpRepository.getBulkChirpsByIds(
              chirpThread.filter((chirp) => chirp !== null) as number[],
            )
          : [];

        const hasThread =
          threadChirpsWithAuhor && threadChirpsWithAuhor.length > 0;

        const threadIds = threadChirpsWithAuhor.map((chirp) => chirp.id);

        const parentChirp =
          threadChirpsWithAuhor.length === 1 &&
          threadChirpsWithAuhor[0].parentToId
            ? await chirpRepository.getChirpDetails(
                threadChirpsWithAuhor[0].parentToId,
              )
            : null;

        reply.code(200).send({
          parent: parentChirp,
          replys: !hasThread
            ? chirpDetails.related
            : chirpDetails.related.filter(
                (chirp) => !threadIds.includes(chirp.id),
              ),
          thread: hasThread ? threadChirpsWithAuhor : [chirpDetails],
        });
      } catch (err) {
        const error = err as Error;

        reply.code(422).send({
          status: error.name,
          error: error.message,
          cause: error.cause,
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
      const { chirpId } = request.body as { chirpId: number };

      invariant(chirpId, 'chirpID not found');

      invariant(
        typeof chirpId === 'number',
        'chirpID must be a valid number id',
      );

      const payload = await chirpRepository.updateChirpLikes(chirpId);

      reply.code(200).send({ payload });
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
        const payload = request.body as ChirpDTO;

        invariant(payload, 'payload not found');

        chirpRepository.createNewChirp(payload);

        reply.code(201).send({ payload });
      } catch (error) {
        reply.code(422).send({ error: error });
      }
    },
  );
}
