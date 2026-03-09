export type BugSeverity = "critical" | "high" | "medium" | "low";

export type BugStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "verified"
  | "closed";

export interface BugAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // base64 data URL or blob URL
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: BugSeverity;
  status: BugStatus;
  reportedBy: string;
  reportedByEmail: string;
  createdAt: string; // ISO date
  updatedAt: string;
  resolvedBy?: string;
  resolvedByEmail?: string;
  resolvedAt?: string;
  resolvingDescription?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedByEmail?: string;
  verifierRemarks?: string;
  environment?: string;
  version?: string;
  locationRoute?: string;
  appName?: string;
  attachments: BugAttachment[];
}

export interface BugComment {
  id: string;
  bugId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAt: string; // ISO date
}

export type BugCreate = Omit<
  Bug,
  "id" | "createdAt" | "updatedAt"
> & { createdAt?: string; updatedAt?: string };
