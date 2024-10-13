"use server";

import { revalidatePath } from "next/cache";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  addPetByUserId,
  checkAuth,
  createNewUser,
  deletePetById,
  getPetById,
  updatePetById,
} from "@/lib/server-utils";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// --------------- User Actions -----------------

export async function signUp(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    console.log("Invalid sign up formData object");
    return;
  }
  const formDataObject = Object.fromEntries(formData.entries());
  // validate form data
  const validatedFormData = authSchema.safeParse(formDataObject);
  if (!validatedFormData.success) {
    console.log("Invalid sign up form data - failed zod schema validation");
    return;
  }
  const hashedPassword = await bcrypt.hash(validatedFormData.data.password, 10);
  try {
    await createNewUser(validatedFormData.data.email, hashedPassword);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      //if (error.code === "P2002") {
      return {
        message: "User with this email already exists",
      };
      //}
    }
  }
  await signIn("credentials", formData);
}

export async function logIn(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    console.log("Invalid log in formData object");
    return {
      message: "Internal error invalid log in form data",
    };
  }
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return {
            message: "Invalid credentials.",
          };
        }
        default: {
          return {
            message: "Error. Could not sign in.",
          };
        }
      }
    }
    throw error; // nextjs redirects throws error, so we need to rethrow it
  }
}

export async function LogOut() {
  await signOut({ redirectTo: "/" });
}

//----------------- Pet Actions -----------------

export async function addPet(pet: unknown) {
  const session = await checkAuth();

  const validatedPet = petFormSchema.safeParse(pet);
  if (!validatedPet.success) {
    return {
      message: "Invalid pet data.",
    };
  }
  try {
    await addPetByUserId(session.user.id, validatedPet.data);
  } catch (error) {
    return {
      message: "An error occurred while adding the pet.",
    };
  }
  revalidatePath("/app", "layout");
}

export async function editPet(petId: unknown, pet: unknown) {
  const session = await checkAuth();

  // validation
  const validatedPetId = petIdSchema.safeParse(petId);
  const validatedPet = petFormSchema.safeParse(pet);

  if (!validatedPetId.success || !validatedPet.success) {
    return {
      message: "Invalid pet data.",
    };
  }
  // authorization check
  const petData = await getPetById(validatedPetId.data);
  if (!petData) {
    return {
      message: "Pet not found.",
    };
  }
  if (petData.userId !== session.user.id) {
    return {
      message: "You are not authorized to edit this pet.",
    };
  }
  // update pet
  try {
    await updatePetById(validatedPetId.data, validatedPet.data);
  } catch (error) {
    return {
      message: "An error occurred while updating pet.",
    };
  }
  revalidatePath("/app", "layout");
}

export async function removePet(petId: unknown) {
  const session = await checkAuth();
  // validation
  const validatedPetId = petIdSchema.safeParse(petId);
  if (!validatedPetId.success) {
    return {
      message: "Invalid pet data.",
    };
  }
  // authorization check
  const pet = await getPetById(validatedPetId.data);
  if (!pet) {
    return {
      message: "Pet not found.",
    };
  }
  if (pet.userId !== session.user.id) {
    return {
      message: "You are not authorized to remove this pet.",
    };
  }
  // delete pet
  try {
    await deletePetById(validatedPetId.data);
  } catch (error) {
    return {
      message: "An error occurred while removing pet.",
    };
  }
  revalidatePath("/app", "layout");
}

// --- payment actions ---

export async function createCheckoutSession() {
  // authentication check
  const session = await checkAuth();

  // create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: process.env.PRODUCT_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?cancelled=true`,
  });

  // redirect user
  redirect(checkoutSession.url);
}
