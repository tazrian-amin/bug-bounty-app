import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export interface UserProfile {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  username: string;
  avatar: string | null;
}

export type CreateUserInput = {
  email: string;
  name: string;
  username: string;
  password: string;
};

const SALT_ROUNDS = 10;
let seeded = false;

async function ensureSeedUsers() {
  if (seeded) return;

  const defaults = [
    {
      email: "admin@mining-sentry.com",
      password: "admin123",
      name: "Admin User",
      username: "admin",
    },
    {
      email: "dev@mining-sentry.com",
      password: "dev123",
      name: "Dev User",
      username: "dev",
    },
  ];

  for (const u of defaults) {
    const email = u.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: u.name,
          username: u.username,
          passwordHash: await bcrypt.hash(u.password, SALT_ROUNDS),
          avatar: null,
        },
      });
    }
  }

  seeded = true;
}

function toUserProfile(user: {
  id: string;
  email: string | null;
  passwordHash: string;
  name: string | null;
  username: string;
  avatar: string | null;
}): UserProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    passwordHash: user.passwordHash,
    name: user.name ?? "",
    username: user.username,
    avatar: user.avatar,
  };
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  await ensureSeedUsers();
  const normalized = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || !user.email) return null;
  return toUserProfile(user);
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  await ensureSeedUsers();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.email) return null;
  return toUserProfile(user);
}

export async function validatePassword(email: string, password: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function getProfileForSession(email: string): Promise<{ name: string; username: string } | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  return { name: user.name, username: user.username };
}

export async function createUser(input: CreateUserInput): Promise<UserProfile> {
  await ensureSeedUsers();
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      username: input.username,
      passwordHash: await bcrypt.hash(input.password, SALT_ROUNDS),
      avatar: null,
      image: null,
    },
  });
  return toUserProfile(user);
}

export async function updateProfile(
  email: string,
  updates: { name?: string; username?: string; avatar?: string | null }
): Promise<UserProfile | null> {
  await ensureSeedUsers();
  const normalized = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (!existing) return null;

  const user = await prisma.user.update({
    where: { email: normalized },
    data: {
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.username !== undefined ? { username: updates.username } : {}),
      ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
      ...(updates.avatar !== undefined ? { image: updates.avatar } : {}),
    },
  });

  return toUserProfile(user);
}

export async function updatePassword(email: string, newPassword: string): Promise<boolean> {
  await ensureSeedUsers();
  const normalized = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (!existing) return false;

  await prisma.user.update({
    where: { email: normalized },
    data: { passwordHash: await bcrypt.hash(newPassword, SALT_ROUNDS) },
  });
  return true;
}

export async function updatePasswordByUserId(userId: string, newPassword: string): Promise<boolean> {
  await ensureSeedUsers();
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, SALT_ROUNDS) },
  });
  return true;
}
