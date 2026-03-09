import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  getAllBugs,
  createBug,
  getBugsByStatus,
} from "@/lib/bugs";
import { CreateBugSchema } from "@/lib/bug-schemas";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats");
  if (stats === "true") {
    const counts = await getBugsByStatus();
    return NextResponse.json(counts);
  }
  const bugs = await getAllBugs();
  return NextResponse.json(bugs);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = CreateBugSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid bug payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const input = parsed.data;
    const bug = await createBug({
      ...input,
      status: input.status ?? "new",
      reportedBy: session.user.name ?? "Unknown",
      reportedByEmail: session.user.email ?? "",
      attachments: input.attachments ?? [],
    });
    return NextResponse.json(bug);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create bug" },
      { status: 400 }
    );
  }
}
