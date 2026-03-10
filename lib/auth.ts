import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUserByEmail, validatePassword } from "@/lib/users";

const rawNextAuthUrl = process.env.NEXTAUTH_URL?.trim();
if (rawNextAuthUrl && !/^https?:\/\//i.test(rawNextAuthUrl)) {
  const protocol = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawNextAuthUrl)
    ? "http://"
    : "https://";
  process.env.NEXTAUTH_URL = `${protocol}${rawNextAuthUrl}`;
}

const signInSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(1),
});

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: nextAuthSecret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const parsed = signInSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const email = parsed.data.email.toLowerCase();
          const password = parsed.data.password;
          const rawHeaders = req?.headers as unknown;
          const ipHeader =
            rawHeaders && typeof rawHeaders === "object" && "get" in rawHeaders
              ? (rawHeaders as Headers).get("x-forwarded-for")
              : (rawHeaders as Record<string, string | string[] | undefined> | undefined)?.[
                  "x-forwarded-for"
                ];
          const ipValue = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader;
          const ip = typeof ipValue === "string" ? ipValue.split(",")[0].trim() : "unknown";
          const allowed = checkRateLimit(`signin:${email}:${ip}`, 10, 10 * 60 * 1000);
          if (!allowed) return null;

          const ok = await validatePassword(email, password);
          if (!ok) return null;

          const user = await getUserByEmail(email);
          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (error) {
          console.error("Credentials authorize failed", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.name = user.name ?? "";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.image = typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
};
