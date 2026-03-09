export type AchievementCategory = "report" | "resolve";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  requiredCount: number;
  icon: string; // MUI icon name or emoji
  badgeColor: string; // for avatar/badge styling
}

export interface UserStats {
  email: string;
  name: string;
  reportedCount: number;
  resolvedCount: number;
}

export interface UserAchievement {
  email: string;
  name: string;
  stats: UserStats;
  earnedBadges: AchievementDef[];
  totalScore: number; // simple sum of badge "tiers" for ranking
}
