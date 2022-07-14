import { Chirp, User, Prisma } from '@prisma/client';

export type ChirpDTO = Prisma.Without<
  Prisma.ChirpCreateInput,
  Prisma.ChirpUncheckedCreateInput
> &
  Prisma.ChirpUncheckedCreateInput;

export type ChirpThread = Chirp & {
  thread: Array<number | null>;
};

export type ChirpWithAuhtor = Chirp & {
  author: User;
};
