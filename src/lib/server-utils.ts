import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth-no-edge";
import { Pet, User } from "@prisma/client";
import prisma from "./db";
import { TPetEssentials } from "./types";

export async function checkAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function getUserByEmail(email: User["email"]) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}

export async function getPetById(petId: Pet["id"]) {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });
  return pet;
}

export async function getPetsByUserId(userId: User["id"]) {
  const pets = await prisma.pet.findMany({
    where: {
      userId,
    },
  });
  return pets;
}

export async function deletePetById(petId: Pet["id"]) {
  await prisma.pet.delete({
    where: {
      id: petId,
    },
  });
}

export async function updatePetById(petId: Pet["id"], data: TPetEssentials) {
  await prisma.pet.update({
    where: {
      id: petId,
    },
    data,
  });
}

export async function addPetByUserId(userId: User["id"], data: TPetEssentials) {
  await prisma.pet.create({
    data: {
      ...data,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function createNewUser(email: string, hashedPassword: string) {
  await prisma.user.create({
    data: {
      email: email,
      hashedPassword: hashedPassword,
    },
  });
}
