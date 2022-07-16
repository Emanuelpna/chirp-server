import { Chirp, User, Prisma } from '@prisma/client';

export type ChirpDTOCreate = Prisma.Without<
  Prisma.ChirpCreateInput,
  Prisma.ChirpUncheckedCreateInput
> &
  Prisma.ChirpUncheckedCreateInput;

export type ChirpDTOUpdate = Prisma.Without<
  Prisma.ChirpUpdateInput,
  Prisma.ChirpUncheckedUpdateInput
> &
  Prisma.ChirpUncheckedUpdateInput;

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
