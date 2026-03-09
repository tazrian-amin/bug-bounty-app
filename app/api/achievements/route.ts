import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getAllAchievements, getAchievementForUser } from "@/lib/achievements";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leaderboard = await getAllAchievements();
  const me = await getAchievementForUser(session.user.email);
  return NextResponse.json({
    me: me ?? {
      email: session.user.email,
      name: session.user.name ?? "Unknown",
      stats: { email: session.user.email, name: session.user.name ?? "Unknown", reportedCount: 0, resolvedCount: 0 },
      earnedBadges: [],
      totalScore: 0,
    },
    leaderboard,
  });
}
