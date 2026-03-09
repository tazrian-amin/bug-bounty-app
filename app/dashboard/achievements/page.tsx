"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SportsMmaRoundedIcon from "@mui/icons-material/SportsMmaRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import type { UserAchievement } from "@/types/achievement";

const ICON_MAP: Record<string, React.ComponentType<{ sx?: object }>> = {
  BugReport: BugReportRoundedIcon,
  Search: SearchRoundedIcon,
  Visibility: VisibilityRoundedIcon,
  Star: StarRoundedIcon,
  EmojiEvents: EmojiEventsRoundedIcon,
  CheckCircle: CheckCircleRoundedIcon,
  Build: BuildRoundedIcon,
  SportsMma: SportsMmaRoundedIcon,
  Shield: ShieldRoundedIcon,
  LocalFireDepartment: LocalFireDepartmentRoundedIcon,
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function BadgeCard({
  name,
  description,
  icon,
  badgeColor,
}: {
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
}) {
  const IconComp = ICON_MAP[icon] ?? EmojiEventsRoundedIcon;
  return (
    <Card elevation={0} className="border border-slate-200 overflow-hidden">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: badgeColor,
            color: "white",
            mb: 1,
          }}
        >
          <IconComp sx={{ fontSize: 28 }} />
        </Avatar>
        <Typography variant="subtitle2" fontWeight={600}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function MemberRow({
  rank,
  member,
  isCurrentUser,
}: {
  rank: number;
  member: UserAchievement;
  isCurrentUser: boolean;
}) {
  return (
    <Card
      elevation={0}
      className={`border overflow-hidden ${isCurrentUser ? "border-[#ffc500] ring-1 ring-[#ffc500]/30" : "border-slate-200"}`}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <Box className="flex items-center gap-3 min-w-0">
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ minWidth: 28, fontWeight: 700 }}
          >
            #{rank}
          </Typography>
          <Avatar
            sx={{
              bgcolor: isCurrentUser ? "#ffc500" : "primary.main",
              color: isCurrentUser ? "#050404" : "white",
              width: 40,
              height: 40,
            }}
          >
            {getInitials(member.name)}
          </Avatar>
          <Box className="min-w-0">
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {member.name}
              {isCurrentUser && (
                <Chip label="You" size="small" sx={{ ml: 1, height: 20 }} />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {member.stats.reportedCount} reported · {member.stats.resolvedCount} resolved
            </Typography>
          </Box>
        </Box>
        <Box className="flex flex-wrap gap-1 sm:ml-auto">
          {member.earnedBadges.slice(0, 5).map((b) => {
            const IconComp = ICON_MAP[b.icon] ?? EmojiEventsRoundedIcon;
            return (
              <Avatar
                key={b.id}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: b.badgeColor,
                  color: "white",
                }}
                title={b.name}
              >
                <IconComp sx={{ fontSize: 16 }} />
              </Avatar>
            );
          })}
          {member.earnedBadges.length > 5 && (
            <Chip
              size="small"
              label={`+${member.earnedBadges.length - 5}`}
              sx={{ height: 32 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AchievementsPage() {
  const [data, setData] = useState<{
    me: UserAchievement;
    leaderboard: UserAchievement[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center py-12">
        <Typography color="text.secondary">Loading achievements…</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <Typography color="text.secondary">Failed to load achievements.</Typography>
      </Box>
    );
  }

  const { me, leaderboard } = data;

  return (
    <Box className="flex flex-col gap-6 overflow-x-hidden">
      <Typography variant="h5" fontWeight={700} className="text-black text-lg sm:text-xl md:text-2xl">
        Achievements
      </Typography>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            My progress
          </Typography>
          <Box className="flex flex-wrap gap-4 mb-4">
            <Chip
              icon={<BugReportRoundedIcon />}
              label={`${me.stats.reportedCount} bugs reported`}
              variant="outlined"
              sx={{ py: 1.5 }}
            />
            <Chip
              icon={<CheckCircleRoundedIcon />}
              label={`${me.stats.resolvedCount} bugs resolved`}
              variant="outlined"
              sx={{ py: 1.5 }}
            />
            <Chip
              icon={<EmojiEventsRoundedIcon />}
              label={`${me.earnedBadges.length} badges earned`}
              color="primary"
              sx={{ py: 1.5 }}
            />
          </Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Your badges
          </Typography>
          {me.earnedBadges.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Report or resolve bugs to earn your first badge!
            </Typography>
          ) : (
            <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
              {me.earnedBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  icon={badge.icon}
                  badgeColor={badge.badgeColor}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Leaderboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compare with your team. Earn badges by reporting and resolving bugs.
          </Typography>
          <Box className="flex flex-col gap-2">
            {leaderboard.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No members on the leaderboard yet.
              </Typography>
            ) : (
              leaderboard.map((member, i) => (
                <MemberRow
                  key={member.email}
                  rank={i + 1}
                  member={member}
                  isCurrentUser={member.email === me.email}
                />
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
