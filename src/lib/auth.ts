import NextAuth, { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import Credentials from "next-auth/providers/credentials";
import { authSchema } from "./validations";

export const nextAuthConfig = {
  pages: {
    signIn: "/login",
  },
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
  callbacks: {
    // run on every middleware request
    authorized: ({ auth, request }) => {
      const { pathname } = request.nextUrl;
      const isAppRoute = pathname.startsWith("/app");
      const authenticated = Boolean(auth?.user);
      if (isAppRoute && !authenticated) {
        return false;
      }
      if (isAppRoute && authenticated && auth?.user.hasAccess) {
        return true;
      }
      if (isAppRoute && authenticated && !auth?.user.hasAccess) {
        return false;
      }
      if (!isAppRoute && !authenticated) {
        return true;
      }
      if (!isAppRoute && authenticated) {
        if (!pathname.includes("/payment") && !auth?.user.hasAccess) {
          return Response.redirect(new URL("/payment", request.nextUrl));
        } else {
          return true;
        }
      }
      // Safety assume user is not authenticated
      return false;
    },
    jwt: async ({ token, user, trigger }) => {
      if (user?.id) {
        token.userId = user.id;
        token.email = user.email!;
        token.hasAccess = user.hasAccess;
      }
      if (trigger === "update") {
        const userFromDb = await getUserByEmail(token.email);
        if (userFromDb) {
          token.hasAccess = userFromDb.hasAccess;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.user.hasAccess = token.hasAccess;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(nextAuthConfig);
