import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getBugById, getCommentsByBugId, addComment } from "@/lib/bugs";
import { AddBugCommentSchema } from "@/lib/bug-schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await getBugById(id))) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  const comments = await getCommentsByBugId(id);
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = AddBugCommentSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid comment payload";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }
  const text = parsed.data.body;
  const comment = await addComment(id, {
    authorName: session.user.name ?? session.user.email ?? "User",
    authorEmail: session.user.email,
    body: text,
  });
  if (!comment) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 });
  }
  return NextResponse.json(comment);
}
