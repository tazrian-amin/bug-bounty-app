import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  getAllBugs,
  createBug,
  getBugsByStatus,
} from "@/lib/bugs";
import type { BugCreate } from "@/types/bug";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats");
  if (stats === "true") {
    const counts = getBugsByStatus();
    return NextResponse.json(counts);
  }
  const bugs = getAllBugs();
  return NextResponse.json(bugs);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as BugCreate & { attachments?: BugCreate["attachments"] };
    const bug = createBug({
      ...body,
      status: body.status ?? "new",
      reportedBy: session.user.name ?? "Unknown",
      reportedByEmail: session.user.email ?? "",
      attachments: body.attachments ?? [],
    });
    return NextResponse.json(bug);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create bug" },
      { status: 400 }
    );
  }
}
