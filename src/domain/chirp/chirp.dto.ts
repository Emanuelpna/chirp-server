import { Chirp, User, Prisma } from '@prisma/client';

export type ChirpDTO = Prisma.Without<
  Prisma.ChirpCreateInput,
  Prisma.ChirpUncheckedCreateInput
> &
  Prisma.ChirpUncheckedCreateInput;

export type ChirpTree = Chirp &
  User & {
    thread: Array<number | null>;
  };

export type ChirpTreeID = {
  thread: Array<number | null>;
};

export type ChirpWithAuhtor = Chirp & {
  author: User;
};

export type ChirpWithAuhtorAndRelated = Chirp & {
  author: User;
  related: Chirp[];
};
