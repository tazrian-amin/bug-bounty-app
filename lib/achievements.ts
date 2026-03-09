import { getAllBugs } from "@/lib/bugs";
import type { AchievementDef, UserAchievement } from "@/types/achievement";

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Reporting
  { id: "first-bug", name: "First Bug", description: "Report your first bug", category: "report", requiredCount: 1, icon: "BugReport", badgeColor: "#94a3b8" },
  { id: "bug-hunter", name: "Bug Hunter", description: "Report 5 bugs", category: "report", requiredCount: 5, icon: "Search", badgeColor: "#4cb1e5" },
  { id: "bug-detective", name: "Bug Detective", description: "Report 10 bugs", category: "report", requiredCount: 10, icon: "Visibility", badgeColor: "#6366f1" },
  { id: "bug-buster", name: "Bug Buster", description: "Report 25 bugs", category: "report", requiredCount: 25, icon: "Star", badgeColor: "#ffc500" },
  { id: "bug-legend", name: "Bug Legend", description: "Report 50 bugs", category: "report", requiredCount: 50, icon: "EmojiEvents", badgeColor: "#eab308" },
  // Resolving
  { id: "resolver", name: "Resolver", description: "Resolve your first bug", category: "resolve", requiredCount: 1, icon: "CheckCircle", badgeColor: "#22c55e" },
  { id: "fix-master", name: "Fix Master", description: "Resolve 5 bugs", category: "resolve", requiredCount: 5, icon: "Build", badgeColor: "#14b8a6" },
  { id: "bug-crusher", name: "Bug Crusher", description: "Resolve 10 bugs", category: "resolve", requiredCount: 10, icon: "SportsMma", badgeColor: "#f97316" },
  { id: "quality-guardian", name: "Quality Guardian", description: "Resolve 25 bugs", category: "resolve", requiredCount: 25, icon: "Shield", badgeColor: "#8b5cf6" },
  { id: "bug-slayer", name: "Bug Slayer", description: "Resolve 50 bugs", category: "resolve", requiredCount: 50, icon: "LocalFireDepartment", badgeColor: "#ef4444" },
];

function getStatsForAllUsers(): Map<string, { name: string; reported: number; resolved: number }> {
  const bugs = getAllBugs();
  const map = new Map<string, { name: string; reported: number; resolved: number }>();

  for (const bug of bugs) {
    const email = bug.reportedByEmail;
    if (email) {
      const cur = map.get(email) ?? { name: bug.reportedBy, reported: 0, resolved: 0 };
      cur.reported += 1;
      map.set(email, cur);
    }
    const resolvedEmail = bug.resolvedByEmail;
    if (resolvedEmail && (bug.status === "resolved" || bug.status === "verified" || bug.status === "closed")) {
      const cur = map.get(resolvedEmail) ?? { name: bug.resolvedBy ?? "Unknown", reported: 0, resolved: 0 };
      cur.resolved += 1;
      map.set(resolvedEmail, cur);
    }
  }

  return map;
}

function getEarnedBadges(
  reportedCount: number,
  resolvedCount: number
): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter((a) => {
    const count = a.category === "report" ? reportedCount : resolvedCount;
    return count >= a.requiredCount;
  });
}

function scoreForBadges(badges: AchievementDef[]): number {
  return badges.reduce((sum, b) => sum + b.requiredCount, 0);
}

export function getAllAchievements(): UserAchievement[] {
  const statsMap = getStatsForAllUsers();
  const result: UserAchievement[] = [];

  for (const [email, data] of statsMap) {
    const earned = getEarnedBadges(data.reported, data.resolved);
    result.push({
      email,
      name: data.name,
      stats: {
        email,
        name: data.name,
        reportedCount: data.reported,
        resolvedCount: data.resolved,
      },
      earnedBadges: earned,
      totalScore: scoreForBadges(earned),
    });
  }

  return result.sort((a, b) => b.totalScore - a.totalScore);
}

export function getAchievementForUser(email: string): UserAchievement | null {
  const all = getAllAchievements();
  return all.find((a) => a.email === email) ?? null;
}
