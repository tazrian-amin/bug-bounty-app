import { prisma } from "@/lib/prisma";
import type { Bug, BugCreate, BugStatus, BugComment } from "@/types/bug";

let seeded = false;

function toBug(bug: {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: string;
  status: string;
  reportedBy: string;
  reportedByEmail: string;
  resolvedBy: string | null;
  resolvedByEmail: string | null;
  resolvedAt: Date | null;
  resolvingDescription: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  verifiedByEmail: string | null;
  verifierRemarks: string | null;
  environment: string | null;
  version: string | null;
  locationRoute: string | null;
  appName: string | null;
  createdAt: Date;
  updatedAt: Date;
  attachments: { id: string; name: string; type: string; size: number; url: string }[];
}): Bug {
  return {
    id: bug.id,
    title: bug.title,
    description: bug.description,
    stepsToReproduce: bug.stepsToReproduce,
    expectedResult: bug.expectedResult,
    actualResult: bug.actualResult,
    severity: bug.severity as Bug["severity"],
    status: bug.status as BugStatus,
    reportedBy: bug.reportedBy,
    reportedByEmail: bug.reportedByEmail,
    resolvedBy: bug.resolvedBy ?? undefined,
    resolvedByEmail: bug.resolvedByEmail ?? undefined,
    resolvedAt: bug.resolvedAt ? bug.resolvedAt.toISOString() : undefined,
    resolvingDescription: bug.resolvingDescription ?? undefined,
    verifiedAt: bug.verifiedAt ? bug.verifiedAt.toISOString() : undefined,
    verifiedBy: bug.verifiedBy ?? undefined,
    verifiedByEmail: bug.verifiedByEmail ?? undefined,
    verifierRemarks: bug.verifierRemarks ?? undefined,
    environment: bug.environment ?? undefined,
    version: bug.version ?? undefined,
    locationRoute: bug.locationRoute ?? undefined,
    appName: bug.appName ?? undefined,
    createdAt: bug.createdAt.toISOString(),
    updatedAt: bug.updatedAt.toISOString(),
    attachments: bug.attachments,
  };
}

function toBugComment(comment: {
  id: string;
  bugId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAt: Date;
}): BugComment {
  return {
    id: comment.id,
    bugId: comment.bugId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  };
}

async function ensureSeedBugs() {
  if (seeded) return;

  const count = await prisma.bug.count();
  if (count > 0) {
    seeded = true;
    return;
  }

  await prisma.bug.create({
    data: {
      id: "seed-bug-1",
      title: "Dashboard fails to load on Safari",
      description: "The main dashboard shows a blank screen when accessed from Safari 17.",
      stepsToReproduce: "1. Open Safari\n2. Navigate to dashboard\n3. Observe blank screen",
      expectedResult: "Dashboard should render with charts and table.",
      actualResult: "Blank white screen, console shows CORS error.",
      severity: "high",
      status: "in_progress",
      reportedBy: "Admin User",
      reportedByEmail: "admin@mining-sentry.com",
      environment: "Safari 17, macOS",
      createdAt: new Date("2025-03-01T10:00:00Z"),
      updatedAt: new Date("2025-03-05T14:00:00Z"),
    },
  });

  await prisma.bug.create({
    data: {
      id: "seed-bug-2",
      title: "Export to PDF truncates long tables",
      description: "When exporting a table with more than 50 rows, the PDF only contains first 50 rows.",
      stepsToReproduce: "1. Open Reports\n2. Select table with 100+ rows\n3. Click Export PDF",
      expectedResult: "Full table in PDF with pagination if needed.",
      actualResult: "PDF stops at row 50.",
      severity: "medium",
      status: "new",
      reportedBy: "Dev User",
      reportedByEmail: "dev@mining-sentry.com",
      createdAt: new Date("2025-03-03T09:30:00Z"),
      updatedAt: new Date("2025-03-03T09:30:00Z"),
    },
  });

  await prisma.bug.create({
    data: {
      id: "seed-bug-3",
      title: "Login session expires too quickly",
      description: "Users are logged out after ~5 minutes of inactivity.",
      stepsToReproduce: "1. Log in\n2. Leave tab idle for 5 min\n3. Click anywhere",
      expectedResult: "Session should last at least 30 minutes.",
      actualResult: "Redirected to login after ~5 min.",
      severity: "critical",
      status: "verified",
      reportedBy: "Admin User",
      reportedByEmail: "admin@mining-sentry.com",
      resolvedBy: "Admin User",
      resolvedByEmail: "admin@mining-sentry.com",
      resolvedAt: new Date("2025-03-04T11:00:00Z"),
      resolvingDescription: "Increased session max age and refreshed token on activity.",
      verifiedAt: new Date("2025-03-05T09:00:00Z"),
      verifiedBy: "Dev User",
      verifiedByEmail: "dev@mining-sentry.com",
      verifierRemarks: "Confirmed fix in staging. Session now lasts 30+ min.",
      createdAt: new Date("2025-02-28T16:00:00Z"),
      updatedAt: new Date("2025-03-05T09:00:00Z"),
    },
  });

  seeded = true;
}

export async function getAllBugs(): Promise<Bug[]> {
  await ensureSeedBugs();
  const bugs = await prisma.bug.findMany({
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });
  return bugs.map(toBug);
}

export async function getBugById(id: string): Promise<Bug | undefined> {
  await ensureSeedBugs();
  const bug = await prisma.bug.findUnique({ where: { id }, include: { attachments: true } });
  return bug ? toBug(bug) : undefined;
}

export async function createBug(input: BugCreate): Promise<Bug> {
  await ensureSeedBugs();
  const bug = await prisma.bug.create({
    data: {
      title: input.title,
      description: input.description,
      stepsToReproduce: input.stepsToReproduce,
      expectedResult: input.expectedResult,
      actualResult: input.actualResult,
      severity: input.severity,
      status: input.status,
      reportedBy: input.reportedBy,
      reportedByEmail: input.reportedByEmail,
      resolvedBy: input.resolvedBy ?? null,
      resolvedByEmail: input.resolvedByEmail ?? null,
      resolvedAt: input.resolvedAt ? new Date(input.resolvedAt) : null,
      resolvingDescription: input.resolvingDescription ?? null,
      verifiedAt: input.verifiedAt ? new Date(input.verifiedAt) : null,
      verifiedBy: input.verifiedBy ?? null,
      verifiedByEmail: input.verifiedByEmail ?? null,
      verifierRemarks: input.verifierRemarks ?? null,
      environment: input.environment ?? null,
      version: input.version ?? null,
      locationRoute: input.locationRoute ?? null,
      appName: input.appName ?? null,
      createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
      updatedAt: input.updatedAt ? new Date(input.updatedAt) : new Date(),
      attachments: {
        create: (input.attachments ?? []).map((att) => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url,
        })),
      },
    },
    include: { attachments: true },
  });

  return toBug(bug);
}

export async function updateBug(id: string, updates: Partial<Bug>): Promise<Bug | null> {
  await ensureSeedBugs();
  const exists = await prisma.bug.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return null;

  if (updates.attachments !== undefined) {
    await prisma.bugAttachment.deleteMany({ where: { bugId: id } });
  }

  const bug = await prisma.bug.update({
    where: { id },
    data: {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.stepsToReproduce !== undefined ? { stepsToReproduce: updates.stepsToReproduce } : {}),
      ...(updates.expectedResult !== undefined ? { expectedResult: updates.expectedResult } : {}),
      ...(updates.actualResult !== undefined ? { actualResult: updates.actualResult } : {}),
      ...(updates.severity !== undefined ? { severity: updates.severity } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.reportedBy !== undefined ? { reportedBy: updates.reportedBy } : {}),
      ...(updates.reportedByEmail !== undefined ? { reportedByEmail: updates.reportedByEmail } : {}),
      ...(updates.resolvedBy !== undefined ? { resolvedBy: updates.resolvedBy ?? null } : {}),
      ...(updates.resolvedByEmail !== undefined ? { resolvedByEmail: updates.resolvedByEmail ?? null } : {}),
      ...(updates.resolvedAt !== undefined ? { resolvedAt: updates.resolvedAt ? new Date(updates.resolvedAt) : null } : {}),
      ...(updates.resolvingDescription !== undefined ? { resolvingDescription: updates.resolvingDescription ?? null } : {}),
      ...(updates.verifiedAt !== undefined ? { verifiedAt: updates.verifiedAt ? new Date(updates.verifiedAt) : null } : {}),
      ...(updates.verifiedBy !== undefined ? { verifiedBy: updates.verifiedBy ?? null } : {}),
      ...(updates.verifiedByEmail !== undefined ? { verifiedByEmail: updates.verifiedByEmail ?? null } : {}),
      ...(updates.verifierRemarks !== undefined ? { verifierRemarks: updates.verifierRemarks ?? null } : {}),
      ...(updates.environment !== undefined ? { environment: updates.environment ?? null } : {}),
      ...(updates.version !== undefined ? { version: updates.version ?? null } : {}),
      ...(updates.locationRoute !== undefined ? { locationRoute: updates.locationRoute ?? null } : {}),
      ...(updates.appName !== undefined ? { appName: updates.appName ?? null } : {}),
      ...(updates.attachments !== undefined
        ? {
            attachments: {
              create: updates.attachments.map((att) => ({
                id: att.id,
                name: att.name,
                type: att.type,
                size: att.size,
                url: att.url,
              })),
            },
          }
        : {}),
    },
    include: { attachments: true },
  });

  return toBug(bug);
}

export async function deleteBug(id: string): Promise<boolean> {
  await ensureSeedBugs();
  const exists = await prisma.bug.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return false;
  await prisma.bug.delete({ where: { id } });
  return true;
}

export async function getBugsByStatus(): Promise<Record<BugStatus, number>> {
  await ensureSeedBugs();
  const bugs = await prisma.bug.findMany({ select: { status: true } });
  const counts: Record<BugStatus, number> = {
    new: 0,
    in_progress: 0,
    resolved: 0,
    verified: 0,
    closed: 0,
  };

  for (const bug of bugs) {
    if (bug.status in counts) {
      counts[bug.status as BugStatus] += 1;
    }
  }
  return counts;
}

export async function getCommentsByBugId(bugId: string): Promise<BugComment[]> {
  await ensureSeedBugs();
  const comments = await prisma.bugComment.findMany({
    where: { bugId },
    orderBy: { createdAt: "asc" },
  });
  return comments.map(toBugComment);
}

export async function addComment(
  bugId: string,
  input: { authorName: string; authorEmail: string; body: string }
): Promise<BugComment | null> {
  await ensureSeedBugs();
  const bug = await prisma.bug.findUnique({ where: { id: bugId }, select: { id: true } });
  if (!bug) return null;

  const comment = await prisma.bugComment.create({
    data: {
      bugId,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      body: input.body,
    },
  });

  return toBugComment(comment);
}
