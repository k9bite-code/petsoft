import NextAuth, { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import Credentials from "next-auth/providers/credentials";
import { authSchema } from "./validations";
import { nextAuthEdgeConfig } from "./auth-edge";

export const nextAuthConfig = {
  ...nextAuthEdgeConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // validation
        const validatedCredentials = authSchema.safeParse(credentials);
        if (!validatedCredentials.success) {
          console.log("Invalid credentials");
          return null;
        }
        const user = await getUserByEmail(validatedCredentials.data.email);
        if (!user) {
          console.log("No user found");
          return null;
        }
        const passwordsMatch = await bcrypt.compare(
          validatedCredentials.data.password,
          user.hashedPassword
        );
        if (!passwordsMatch) {
          console.log("Invalid credentials");
          return null;
        }
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(nextAuthConfig);
