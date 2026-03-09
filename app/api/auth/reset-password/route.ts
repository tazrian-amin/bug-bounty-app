import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { ResetPasswordSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { updatePasswordByUserId } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = checkRateLimit(`reset-password:${ip}`, 12, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 });
    }

    const updated = await updatePasswordByUserId(resetToken.userId, password);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
