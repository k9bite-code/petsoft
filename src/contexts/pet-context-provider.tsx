"use client";

import { addPet, editPet, removePet } from "@/actions/actions";
import { TPetEssentials } from "@/lib/types";
import { Pet } from "@prisma/client";
import { createContext, useOptimistic, useState } from "react";
import { toast } from "sonner";

type PetContextProviderProps = {
  data: Pet[];
  children: React.ReactNode;
};

type PetConextType = {
  pets: Pet[];
  selectedPet: Pet | null;
  selectedPetId: string | null;
  numberOfPets: number;
  handleSelectedPetId: (id: Pet["id"]) => void;
  handleCheckoutPet: (id: string) => Promise<void>;
  handleAddPet: (newPet: TPetEssentials) => Promise<void>;
  handleEditPet: (id: Pet["id"], editedPet: TPetEssentials) => Promise<void>;
};

export const PetContext = createContext<PetConextType | null>(null);

export default function PetContextProvider({
  data,
  children,
}: PetContextProviderProps) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          return [...state, { ...payload, id: Math.random().toString() }];
        case "edit":
          return state.map((pet) => {
            if (pet.id === payload.id) {
              return { ...pet, ...payload.newPet };
            }
            return pet;
          });
        case "delete":
          return state.filter((pet) => pet.id !== payload);
        default:
          return state;
      }
    }
  );

  const selectedPet =
    optimisticPets.find((pet) => pet.id === selectedPetId) || null;
  const numberOfPets = optimisticPets.length;

  function handleSelectedPetId(id: Pet["id"]) {
    if (selectedPetId === id) {
      setSelectedPetId(null);
    } else {
      setSelectedPetId(id);
    }
  }

  const handleAddPet = async (newPet: TPetEssentials) => {
    setOptimisticPets({ action: "add", payload: newPet });
    const error = await addPet(newPet);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleEditPet = async (id: Pet["id"], newPet: TPetEssentials) => {
    setOptimisticPets({ action: "edit", payload: { id: id, newPet } });
    const error = await editPet(id, newPet);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleCheckoutPet = async (id: Pet["id"]) => {
    setOptimisticPets({ action: "delete", payload: id });
    const error = await removePet(id);
    if (error) {
      toast.warning(error.message);
      return;
    }
    setSelectedPetId(null);
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPet,
        selectedPetId,
        numberOfPets,
        handleSelectedPetId,
        handleCheckoutPet,
        handleAddPet,
        handleEditPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
