import NextAuth, { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import Credentials from "next-auth/providers/credentials";

export const nextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        const user = await getUserByEmail(email);
        if (!user) {
          console.log("No user found");
          return null;
        }
        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        );
        if (!passwordsMatch) {
          console.log("Invalid credentials");
          return null;
        }
        console.log("Provider user object:", user);
        return user;
      },
    }),
  ],
  callbacks: {
    // run on every middleware request
    authorized: ({ auth, request }) => {
      const isTryingToAccessApp = request.nextUrl.pathname.includes("/app");
      const isLoggedIn = !!auth?.user;
      if (isTryingToAccessApp && !isLoggedIn) {
        return false;
      }
      if (isTryingToAccessApp && isLoggedIn) {
        return true;
      }
      if (isTryingToAccessApp) {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { auth, signIn } = NextAuth(nextAuthConfig);
