import NextAuth from "next-auth";
import axios from "axios";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { apiUrl } from "@/lib/api-url";

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
          const { data: result } = await axios.post<{
            accessToken: string;
            user: { id: string; name: string; email: string; role: "ADMIN" | "STAFF" | "PUBLIC" };
          }>(apiUrl("/auth/login").toString(), input.data, { timeout: 15000 });
          return { ...result.user, accessToken: result.accessToken };
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
