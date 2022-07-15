import { ChirpTree, ChirpWithAuhtor } from '@/domain/chirp/chirp.dto';

export class ChirpBuilder {
  static toChirpWithAuthor(chirpThread: ChirpTree): ChirpWithAuhtor {
    return {
      id: chirpThread.id,
      likes: chirpThread.likes,
      content: chirpThread.content,
      authorId: chirpThread.authorId,
      isRechirp: chirpThread.isRechirp,
      createdAt: chirpThread.createdAt,
      updatedAt: chirpThread.updatedAt,
      published: chirpThread.published,
      parentToId: chirpThread.parentToId,
      scheduledTo: chirpThread.scheduledTo,
      author: {
        id: chirpThread.authorId,
        name: chirpThread.name,
        avatar: chirpThread.avatar,
        email: chirpThread.email,
        username: chirpThread.username,
      },
    };
  }
}
