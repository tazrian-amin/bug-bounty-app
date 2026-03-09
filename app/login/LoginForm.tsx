"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      const safeCallback =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
          ? callbackUrl
          : "/dashboard";
      router.replace(safeCallback);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Box
      className="min-h-screen flex items-center justify-center bg-slate-100 w-full box-border"
      sx={{ py: 2, px: 1.5, sm: { py: 4, px: 2 } }}
    >
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
              Mining Sentry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bug Report Portal
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom fontWeight={600}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use your company email and password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            No account? <Link href="/signup">Create one</Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            <Link href="/forgot-password">Forgot password?</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
