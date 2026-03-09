"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";

type ResetPasswordClientProps = {
  token: string;
};

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-100 w-full box-border" sx={{ py: 2, px: 1.5, sm: { py: 4, px: 2 } }}>
      <Card className="w-full max-w-md shadow-lg rounded-xl mx-2 sm:mx-4">
        <CardContent sx={{ p: 2.5, sm: { p: 4 } }}>
          <Box className="flex flex-col items-center gap-2 mb-4 sm:mb-6">
            <Box
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-main text-white"
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              <BugReportRoundedIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Reset password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a new password for your account
            </Typography>
          </Box>

          {!token && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Reset token is missing.
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Password updated. Redirecting to login…</Alert>}

          <Box component="form" onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" variant="contained" size="large" className="mt-1" disabled={loading || !token || success}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Back to <Link href="/login">Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
