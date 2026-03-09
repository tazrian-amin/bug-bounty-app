import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserByEmail, validatePassword } from "@/lib/users";

const signInSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;

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
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email ?? "";
        session.user.name = user.name ?? "";
        session.user.image = user.image;
      }
      return session;
    },
  },
};
