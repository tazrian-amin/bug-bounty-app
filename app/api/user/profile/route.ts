import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getUserByEmail, updateProfile } from "@/lib/users";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    email: user.email,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const updates: { name?: string; username?: string; avatar?: string | null } = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.username === "string") updates.username = body.username.trim();
  if (body.avatar === null || typeof body.avatar === "string") updates.avatar = body.avatar ?? null;
  const user = await updateProfile(session.user.email, updates);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    email: user.email,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
  });
}
