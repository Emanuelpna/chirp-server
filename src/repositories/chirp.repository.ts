import {
  ChirpDTO,
  ChirpThread,
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
    const values = await prisma.$queryRaw<ChirpThread[]>`
      WITH RECURSIVE chirp_thread AS (
          SELECT *, array["id","parentToId"] as thread FROM "public"."Chirp" WHERE "authorId" = ${authorId}
          UNION
            SELECT c.*, t.thread||c.id FROM chirp_thread t INNER JOIN "public"."Chirp" c ON c."id" = t."parentToId"
      )
      SELECT * FROM chirp_thread ct WHERE ct."authorId" = ${authorId} ORDER BY greatest(array_length(thread, 1)) desc;
    `;

    return values.filter((chirp) => chirp.thread.includes(chirpId));
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
