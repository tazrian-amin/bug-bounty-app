import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getBugById, updateBug, deleteBug } from "@/lib/bugs";
import type { Bug } from "@/types/bug";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bug = getBugById(id);
  if (!bug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  return NextResponse.json(bug);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const allowed = [
    "title",
    "description",
    "stepsToReproduce",
    "expectedResult",
    "actualResult",
    "severity",
    "status",
    "environment",
    "version",
    "locationRoute",
    "appName",
    "resolvedBy",
    "resolvedByEmail",
    "resolvedAt",
    "resolvingDescription",
    "verifiedAt",
    "verifiedBy",
    "verifiedByEmail",
    "verifierRemarks",
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  const newStatus = body.status as string | undefined;
  if (
    (newStatus === "resolved" || newStatus === "closed") &&
    session.user.name &&
    session.user.email
  ) {
    updates.resolvedBy = session.user.name;
    updates.resolvedByEmail = session.user.email;
    if (body.resolvedAt === undefined) updates.resolvedAt = new Date().toISOString();
  }
  if (body.verifierRemarks !== undefined || body.verifiedAt !== undefined) {
    updates.verifiedAt = body.verifiedAt ?? new Date().toISOString();
    updates.verifiedBy = body.verifiedBy ?? session.user.name ?? "";
    updates.verifiedByEmail = body.verifiedByEmail ?? session.user.email ?? "";
    updates.status = "verified";
  }
  const bug = updateBug(id, updates as Partial<Bug>);
  if (!bug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  return NextResponse.json(bug);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bug = getBugById(id);
  if (!bug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  if (bug.reportedByEmail !== session.user.email) {
    return NextResponse.json({ error: "Only the reporter can delete this bug" }, { status: 403 });
  }
  deleteBug(id);
  return NextResponse.json({ success: true });
}
