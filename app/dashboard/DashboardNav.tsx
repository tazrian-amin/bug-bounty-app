"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import type { Session } from "next-auth";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const drawerItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Achievements", href: "/dashboard/achievements" },
];

type Profile = { name: string; username: string; email: string; avatar: string | null };

export default function DashboardNav({
  user,
}: {
  user: Session["user"];
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);

  const fetchProfile = () => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.email) setProfile(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
    const onProfileUpdated = () => fetchProfile();
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => window.removeEventListener("profile-updated", onProfileUpdated);
  }, []);

  const handleDrawerToggle = () => setDrawerOpen((v) => !v);
  const openAvatarMenu = (e: React.MouseEvent<HTMLElement>) => setAvatarMenuAnchor(e.currentTarget);
  const closeAvatarMenu = () => setAvatarMenuAnchor(null);

  const drawer = (
    <Box sx={{ width: 280, pt: 2, pb: 2 }} role="presentation">
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="body2" noWrap title={user?.email ?? ""}>
          {profile?.name ?? user?.name ?? user?.email ?? ""}
        </Typography>
      </Box>
      <List>
        {drawerItems.map(({ label, href }) => (
          <ListItem key={href} disablePadding>
            <ListItemButton
              component={Link}
              href={href}
              onClick={handleDrawerToggle}
              selected={pathname === href}
              sx={{
                "&.Mui-selected": { bgcolor: "action.selected" },
              }}
            >
              {href === "/dashboard/achievements" && <EmojiEventsRoundedIcon sx={{ mr: 1.5, fontSize: 20 }} />}
              {href === "/dashboard" && <DashboardRoundedIcon sx={{ mr: 1.5, fontSize: 20 }} />}
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#050404" }}>
        <Toolbar className="flex justify-between min-h-[56px] md:min-h-[64px] gap-2">
          <Box className="flex items-center gap-2 sm:gap-3 min-w-0">
            <IconButton
              color="primary"
              aria-label="Open menu"
              onClick={handleDrawerToggle}
              size="medium"
              sx={{ mr: -0.5 }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 sm:gap-2 no-underline text-inherit min-w-0"
            >
              <BugReportRoundedIcon
                sx={{ fontSize: 24, color: "#ffc500", flexShrink: 0 }}
              />
              <span
                className="text-base sm:text-xl md:text-2xl tracking-tight uppercase truncate"
                style={{ fontFamily: "var(--font-anton), sans-serif" }}
              >
                <span className="text-white">Mining </span>
                <span className="text-[#ffc500]">Sentry</span>
              </span>
            </Link>
          </Box>
          <Box className="flex items-center shrink-0">
            <IconButton
              onClick={openAvatarMenu}
              aria-label="User menu"
              aria-controls={avatarMenuAnchor ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={avatarMenuAnchor ? "true" : undefined}
              sx={{ p: 0.5 }}
            >
              <Avatar
                src={profile?.avatar ?? undefined}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#ffc500",
                  color: "#050404",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                {profile?.name ? getInitials(profile.name) : user?.name ? getInitials(user.name) : "?"}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={avatarMenuAnchor}
              open={!!avatarMenuAnchor}
              onClose={closeAvatarMenu}
              onClick={closeAvatarMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: { minWidth: 260, mt: 1.5 },
                },
              }}
            >
              <Box sx={{ px: 2, py: 2 }}>
                <Box className="flex items-center gap-2">
                  <Avatar
                    src={profile?.avatar ?? undefined}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    {profile?.name ? getInitials(profile.name) : getInitials(user?.name)}
                  </Avatar>
                  <Box className="min-w-0">
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {profile?.name ?? user?.name ?? "User"}
                    </Typography>
                    {profile?.username && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        @{profile.username}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {profile?.email ?? user?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <MenuItem component={Link} href="/dashboard/settings">
                <ListItemIcon>
                  <SettingsRoundedIcon fontSize="small" />
                </ListItemIcon>
                User Settings
              </MenuItem>
              <MenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
