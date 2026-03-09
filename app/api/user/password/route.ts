import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { validatePassword, updatePassword } from "@/lib/users";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { currentPassword, newPassword } = body;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "currentPassword and newPassword are required" },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }
  const valid = await validatePassword(session.user.email, currentPassword);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  const ok = await updatePassword(session.user.email, newPassword);
  if (!ok) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
