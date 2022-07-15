import {
  ChirpDTO,
  ChirpThreadID,
  ChirpWithAuhtor,
} from '../domain/chirp/chirp.dto';

import { prisma } from '../database';

export class ChirpRepository {
  async getChirps() {
    return await prisma.chirp.findMany({
      where: { parentToId: null },
      include: { related: true, author: true },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getChirpDetails(chirpId: number) {
    return await prisma.chirp.findUnique({
      where: { id: chirpId },
      include: {
        related: {
          include: {
            author: true,
          },
        },
        author: true,
      },
    });
  }

  async getChirpThread(authorId: number, chirpId: number) {
    return await prisma.$queryRaw<ChirpThreadID[]>`
      WITH RECURSIVE ChirpThread AS (
          SELECT c.*, array[c."id", c."parentToId"] as thread
            FROM "Chirp" c, "User" u
            WHERE c."authorId" = ${authorId}
          UNION
            SELECT c.*, t."thread"||c.id FROM ChirpThread as t
              INNER JOIN "Chirp" c ON c."id" = t."parentToId"
      )
      SELECT ct."thread" FROM ChirpThread ct
        WHERE ct."authorId" = ${authorId} AND array_position(ct."thread", ${chirpId}) > 0
        ORDER BY greatest(array_length(ct."thread", 1)) desc
        LIMIT 1;
    `;
  }

  async getBulkChirpsByIds(chirpIds: number[]): Promise<ChirpWithAuhtor[]> {
    return await prisma.chirp.findMany({
      where: {
        id: {
          in: chirpIds,
        },
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateChirpLikes(chirpId: number) {
    const chirps = await prisma.chirp.update({
      data: {
        likes: { increment: 1 },
      },
      where: {
        id: chirpId,
      },
    });

    return chirps;
  }

  async createNewChirp(payload: ChirpDTO) {
    const chirps = await prisma.chirp.create({
      data: payload,
    });

    return chirps;
  }
}
