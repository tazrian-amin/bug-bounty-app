"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

type ProfileForm = {
  name: string;
  username: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    email: string;
    name: string;
    username: string;
    avatar: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [removeAvatarDialogOpen, setRemoveAvatarDialogOpen] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileFormDirty },
  } = useForm<ProfileForm>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");
  const hasPasswordValues = !!(
    (currentPassword ?? "").trim() &&
    (newPassword ?? "").trim() &&
    (confirmPassword ?? "").trim()
  );

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.email) {
          setProfile(data);
          resetProfile({ name: data.name ?? "", username: data.username ?? "" });
          setAvatarFile(data.avatar);
          setAvatarRemoved(false);
        }
      })
      .finally(() => setLoading(false));
  }, [resetProfile]);

  useEffect(() => {
    if (!profileSuccess) return;
    const id = window.setTimeout(() => setProfileSuccess(false), 5000);
    return () => clearTimeout(id);
  }, [profileSuccess]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileError("");
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          avatar: avatarRemoved ? null : (avatarFile ?? profile?.avatar ?? null),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setProfileError(json.error ?? "Failed to update profile");
        return;
      }
      setProfile(json);
      setAvatarFile(json.avatar ?? null);
      setAvatarRemoved(false);
      resetProfile({ name: json.name, username: json.username });
      setProfileSuccess(true);
      router.refresh();
      window.dispatchEvent(new CustomEvent("profile-updated"));
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPasswordError(json.error ?? "Failed to update password");
        return;
      }
      setPasswordSuccess(true);
      resetPassword();
      router.refresh();
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = await fileToDataUrl(file);
    setAvatarFile(url);
    setAvatarRemoved(false);
    e.target.value = "";
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarRemoved(true);
    setRemoveAvatarDialogOpen(false);
  };

  if (loading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <Typography color="text.secondary">Failed to load profile.</Typography>
      </Box>
    );
  }

  const avatarSrc = avatarRemoved ? null : (avatarFile ?? profile.avatar);
  const isAvatarChanged = avatarRemoved ? !!profile.avatar : (avatarFile !== profile.avatar);
  const isProfileDirty = isProfileFormDirty || isAvatarChanged;

  return (
    <Box className="flex flex-col gap-6 overflow-x-hidden">
      <Typography variant="h5" fontWeight={700} className="text-black text-lg sm:text-xl md:text-2xl">
        User Settings
      </Typography>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update your display name, username, and profile photo.
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Box className="flex flex-col items-center gap-2">
              <Avatar
                src={avatarSrc ?? undefined}
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                {!avatarSrc && (
                  <PersonRoundedIcon sx={{ fontSize: 48 }} />
                )}
              </Avatar>
              <Box className="flex gap-1">
                <input
                  accept="image/*"
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    component="span"
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoCameraRoundedIcon />}
                  >
                    Upload
                  </Button>
                </label>
                {avatarSrc && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setRemoveAvatarDialogOpen(true)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>

            <Box
              component="form"
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="flex-1 flex flex-col gap-4"
            >
              {profileError && (
                <Alert severity="error" onClose={() => setProfileError("")}>
                  {profileError}
                </Alert>
              )}
              {profileSuccess && (
                <Alert severity="success" onClose={() => setProfileSuccess(false)}>
                  Profile updated.
                </Alert>
              )}
              <TextField
                label="Name"
                fullWidth
                {...registerProfile("name", { required: "Name is required" })}
                error={!!profileErrors.name}
                helperText={profileErrors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Username"
                fullWidth
                {...registerProfile("username", { required: "Username is required" })}
                error={!!profileErrors.username}
                helperText={profileErrors.username?.message}
                placeholder="e.g. jdoe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email"
                fullWidth
                value={profile.email}
                disabled
                helperText="Email cannot be changed."
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={profileSaving || !isProfileDirty}
              >
                {profileSaving ? "Saving…" : "Save profile"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={removeAvatarDialogOpen}
        onClose={() => setRemoveAvatarDialogOpen(false)}
        aria-labelledby="remove-avatar-dialog-title"
        aria-describedby="remove-avatar-dialog-description"
      >
        <DialogTitle id="remove-avatar-dialog-title">Remove profile photo?</DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-avatar-dialog-description">
            Your profile photo will be removed. Click &quot;Save profile&quot; to apply this change.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveAvatarDialogOpen(false)}>Cancel</Button>
          <Button onClick={removeAvatar} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Change password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your current password and choose a new one.
          </Typography>

          <Box
            component="form"
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="flex flex-col gap-4 max-w-md"
          >
            {passwordError && (
              <Alert severity="error" onClose={() => setPasswordError("")}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" onClose={() => setPasswordSuccess(false)}>
                Password updated. Use your new password next time you sign in.
              </Alert>
            )}
            <TextField
              label="Current password"
              type={showCurrentPassword ? "text" : "password"}
              fullWidth
              {...registerPassword("currentPassword", { required: "Required" })}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      edge="end"
                      size="small"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New password"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              {...registerPassword("newPassword", {
                required: "Required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword((v) => !v)}
                      edge="end"
                      size="small"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm new password"
              type="password"
              fullWidth
              {...registerPassword("confirmPassword", {
                required: "Required",
                validate: (v) => v === newPassword || "Passwords do not match",
              })}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={passwordSaving || !hasPasswordValues}
            >
              {passwordSaving ? "Updating…" : "Update password"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
