import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getBugById, updateBug, deleteBug } from "@/lib/bugs";
import type { Bug } from "@/types/bug";
import { UpdateBugSchema } from "@/lib/bug-schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bug = await getBugById(id);
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
  const parsed = UpdateBugSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid update payload";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  const newStatus = parsed.data.status;
  if (
    (newStatus === "resolved" || newStatus === "closed") &&
    session.user.name &&
    session.user.email
  ) {
    updates.resolvedBy = session.user.name;
    updates.resolvedByEmail = session.user.email;
    if (parsed.data.resolvedAt === undefined) updates.resolvedAt = new Date().toISOString();
  }
  if (parsed.data.verifierRemarks !== undefined || parsed.data.verifiedAt !== undefined) {
    updates.verifiedAt = parsed.data.verifiedAt ?? new Date().toISOString();
    updates.verifiedBy = parsed.data.verifiedBy ?? session.user.name ?? "";
    updates.verifiedByEmail = parsed.data.verifiedByEmail ?? session.user.email ?? "";
    updates.status = "verified";
  }
  const bug = await updateBug(id, updates as Partial<Bug>);
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
  const bug = await getBugById(id);
  if (!bug) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  if (bug.reportedByEmail !== session.user.email) {
    return NextResponse.json({ error: "Only the reporter can delete this bug" }, { status: 403 });
  }
  await deleteBug(id);
  return NextResponse.json({ success: true });
}
