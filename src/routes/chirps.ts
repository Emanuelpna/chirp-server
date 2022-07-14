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

        const threadChirp = await chirpRepository.getChirpThread(
          chirpDetails.author.id,
          chirpId,
        );

        const longestThreadReceived = threadChirp?.[0];

        const threadIds = DistinctArray<number>(
          longestThreadReceived?.thread ?? [],
        );

        const hasThreadIds = threadIds && threadIds.length > 0;

        const threadChirps: ChirpWithAuhtor[] = hasThreadIds
          ? await chirpRepository.getBulkChirpsByIds(threadIds)
          : [];

        const threadChirpsOfSameAuthor = DistinctArray(
          threadChirps,
          (item) => item.author.id === chirpDetails.author.id,
        );

        const parentChirp =
          threadChirpsOfSameAuthor.length === 1 && threadChirp[0].parentToId
            ? await chirpRepository.getChirpDetails(threadChirp[0].parentToId)
            : null;

        reply.code(200).send({
          parent: parentChirp,
          replys: !hasThreadIds
            ? chirpDetails.related
            : chirpDetails.related.filter(
                (chirp) => !threadIds.includes(chirp.id),
              ),
          thread: hasThreadIds ? threadChirpsOfSameAuthor : [chirpDetails],
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
