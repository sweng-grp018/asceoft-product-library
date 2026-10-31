import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentials = z.object({ email: z.email(), password: z.string().min(1) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt", maxAge: 8 * 3600 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const input = credentials.safeParse(raw);
        if (!input.success) return null;
        try {
          const response = await fetch(
            `${process.env.API_URL ?? "http://localhost:4000"}/auth/login`,
            {
              method: "POST",
              cache: "no-store",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(input.data),
            },
          );
          if (!response.ok) return null;
          const result = (await response.json()) as {
            accessToken: string;
            user: { id: string; email: string; role: "ADMIN" | "STAFF" | "PUBLIC" };
          };
          return { ...result.user, name: result.user.email, accessToken: result.accessToken };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : "";
      session.user.id = token.sub ?? "";
      session.user.role = token.role === "ADMIN" || token.role === "STAFF" ? token.role : "PUBLIC";
      return session;
    },
  },
});
