import { NextAuthConfig } from "next-auth";
import { getUserByEmail } from "./server-utils";

export const nextAuthEdgeConfig = {
  pages: {
    signIn: "/login",
  },
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
  providers: [],
} satisfies NextAuthConfig;
