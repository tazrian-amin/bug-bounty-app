import type { BugSeverity, BugStatus } from "@/types/bug";

export const APP_NAMES = [
  "incident-backend",
  "incident-portal",
  "marketing-web",
  "operator-native",
  "operator-portal",
  "portal",
  "portal-e2e",
  "sign-in",
] as const;

export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  verified: "Verified",
  closed: "Closed",
};

export const BUG_SEVERITY_LABELS: Record<BugSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const BUG_STATUS_OPTIONS: { value: BugStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "verified", label: "Verified" },
  { value: "closed", label: "Closed" },
];

export const BUG_SEVERITY_OPTIONS: { value: BugSeverity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const STATUSES_REQUIRING_FLOW: BugStatus[] = ["resolved", "verified"];
export const STATUSES_THAT_PREVENT_NEW: BugStatus[] = ["resolved", "verified", "closed"];
