import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/auth-schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { createUser, getUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = checkRateLimit(`register:${ip}`, 10, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, username, email, password } = parsed.data;

    const existingByEmail = await getUserByEmail(email);
    if (existingByEmail) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const existingByUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingByUsername) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    const user = await createUser({
      name,
      username: username.toLowerCase(),
      email,
      password,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
