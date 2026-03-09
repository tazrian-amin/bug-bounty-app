import type { Bug, BugCreate, BugStatus, BugComment } from "@/types/bug";

const bugs: Bug[] = [
  {
    id: "1",
    title: "Dashboard fails to load on Safari",
    description: "The main dashboard shows a blank screen when accessed from Safari 17.",
    stepsToReproduce: "1. Open Safari\n2. Navigate to dashboard\n3. Observe blank screen",
    expectedResult: "Dashboard should render with charts and table.",
    actualResult: "Blank white screen, console shows CORS error.",
    severity: "high",
    status: "in_progress",
    reportedBy: "Admin User",
    reportedByEmail: "admin@mining-sentry.com",
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-05T14:00:00Z",
    environment: "Safari 17, macOS",
    attachments: [],
  },
  {
    id: "2",
    title: "Export to PDF truncates long tables",
    description: "When exporting a table with more than 50 rows, the PDF only contains first 50 rows.",
    stepsToReproduce: "1. Open Reports\n2. Select table with 100+ rows\n3. Click Export PDF",
    expectedResult: "Full table in PDF with pagination if needed.",
    actualResult: "PDF stops at row 50.",
    severity: "medium",
    status: "new",
    reportedBy: "Dev User",
    reportedByEmail: "dev@mining-sentry.com",
    createdAt: "2025-03-03T09:30:00Z",
    updatedAt: "2025-03-03T09:30:00Z",
    attachments: [],
  },
  {
    id: "3",
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
    resolvedAt: "2025-03-04T11:00:00Z",
    resolvingDescription: "Increased session max age and refreshed token on activity.",
    verifiedAt: "2025-03-05T09:00:00Z",
    verifiedBy: "Dev User",
    verifiedByEmail: "dev@mining-sentry.com",
    verifierRemarks: "Confirmed fix in staging. Session now lasts 30+ min.",
    createdAt: "2025-02-28T16:00:00Z",
    updatedAt: "2025-03-05T09:00:00Z",
    attachments: [],
  },
];

let nextId = 4;

function generateId(): string {
  return String(nextId++);
}

export function getAllBugs(): Bug[] {
  return [...bugs];
}

export function getBugById(id: string): Bug | undefined {
  return bugs.find((b) => b.id === id);
}

export function createBug(input: BugCreate): Bug {
  const now = new Date().toISOString();
  const bug: Bug = {
    ...input,
    id: generateId(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    attachments: input.attachments ?? [],
  };
  bugs.push(bug);
  return bug;
}

export function updateBug(id: string, updates: Partial<Bug>): Bug | null {
  const index = bugs.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const updated = {
    ...bugs[index],
    ...updates,
    id: bugs[index].id,
    updatedAt: new Date().toISOString(),
  };
  bugs[index] = updated;
  return updated;
}

export function deleteBug(id: string): boolean {
  const index = bugs.findIndex((b) => b.id === id);
  if (index === -1) return false;
  bugs.splice(index, 1);
  return true;
}

export function getBugsByStatus(): Record<BugStatus, number> {
  const counts: Record<BugStatus, number> = {
    new: 0,
    in_progress: 0,
    resolved: 0,
    verified: 0,
    closed: 0,
  };
  bugs.forEach((b) => {
    counts[b.status]++;
  });
  return counts;
}

// Comments (in-memory)
const comments: BugComment[] = [];
let nextCommentId = 1;

function generateCommentId(): string {
  return String(nextCommentId++);
}

export function getCommentsByBugId(bugId: string): BugComment[] {
  return comments.filter((c) => c.bugId === bugId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addComment(bugId: string, input: { authorName: string; authorEmail: string; body: string }): BugComment | null {
  if (!getBugById(bugId)) return null;
  const comment: BugComment = {
    id: generateCommentId(),
    bugId,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  return comment;
}
