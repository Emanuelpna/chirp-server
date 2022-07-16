import {
  ChirpTree,
  ChirpDTOCreate,
  ChirpWithAuhtor,
} from '../../domain/chirp/chirp.dto';

import { prisma } from '../../database';

export class ChirpRepository {
  async getChirps() {
    return await prisma.chirp.findMany({
      where: {
        OR: [
          {
            parentToId: null,
            isRechirp: false,
          },
          {
            isRechirp: true,
            parentToId: {
              not: null,
            },
          },
        ],
      },
      include: { related: true, author: true },
      orderBy: {
        createdAt: 'desc',
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

  async getChirpRelated(chirpId: number, authorId: number) {
    return await prisma.chirp.findMany({
      where: {
        parentToId: chirpId,
        authorId: {
          not: authorId,
        },
      },
      include: { author: true },
    });
  }

  async getChirpThread(authorId: number, chirpId: number) {
    return await prisma.$queryRaw<ChirpTree[]>`
      WITH RECURSIVE ChirpThread AS (
          SELECT c.*, u."name", u."avatar", u."email", u."username", array[c."id", c."parentToId"] as thread
            FROM "Chirp" c, "User" u
            WHERE c."authorId" = ${authorId} AND u."id" = ${authorId}
          UNION
            SELECT c.*, u."name", u."avatar", u."email", u."username", t."thread"||c.id FROM ChirpThread as t
              INNER JOIN "Chirp" c ON c."id" = t."parentToId"
              INNER JOIN "User" u ON u."id" = t."authorId"
      )
      SELECT DISTINCT ON (id) * FROM ChirpThread ct
        WHERE ct."authorId" = ${authorId} AND isRechirp = false AND array_position(
          (
            SELECT ict."thread" FROM ChirpThread ict WHERE array_position(ict."thread", ${chirpId}) > 0 ORDER BY greatest(array_length(ict."thread", 1)) desc LIMIT 1
          ), ct."id"
        ) > 0
        ORDER BY id asc, greatest(array_length(ct."thread", 1)) desc;
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

  async updateChirpLikes(id: number) {
    const chirps = await prisma.chirp.update({
      data: {
        likes: { increment: 1 },
      },
      where: {
        id,
      },
    });

    return chirps;
  }

  async createNewChirp(payload: ChirpDTOCreate) {
    const chirps = await prisma.chirp.create({
      data: payload,
    });

    return chirps;
  }
}
