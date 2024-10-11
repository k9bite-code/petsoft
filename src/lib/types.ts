import { Pet } from "@prisma/client";

export type TPetEssentials = Omit<
  Pet,
  "id" | "createdAt" | "updatedAt" | "userId"
>;
