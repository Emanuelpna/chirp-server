import { ChirpWithAuhtor } from '../../domain/chirp/chirp.dto';

import { ChirpBuilder } from '../builders/chirp.builder';
import { ChirpRepository } from '../repositories/chirp.repository';

export class ChirpController {
  constructor(private _chirpRepository: ChirpRepository) {}

  async getChirpThread(chirpId: number, authorId: number) {
    const threadChirpsPromise = this._chirpRepository.getChirpThread(
      authorId,
      chirpId,
    );

    const relatedChirpsPromise = this._chirpRepository.getChirpRelated(
      chirpId,
      authorId,
    );

    const [threadChirps, relatedChirps] = await Promise.all([
      threadChirpsPromise,
      relatedChirpsPromise,
    ]);

    const threadChirpsWithAuhor: ChirpWithAuhtor[] = threadChirps.map((chirp) =>
      ChirpBuilder.toChirpWithAuthor(chirp),
    );

    const parentChirp =
      threadChirpsWithAuhor.length === 1 && threadChirpsWithAuhor[0].parentToId
        ? await this._chirpRepository.getChirpDetails(
            threadChirpsWithAuhor[0].parentToId,
          )
        : null;

    return {
      parent: parentChirp,
      replys: relatedChirps ?? [],
      thread: threadChirpsWithAuhor ?? [],
    };
  }
}
