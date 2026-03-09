"use client";

import Link from "next/link";
import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to process request");
        setLoading(false);
        return;
      }

      setMessage(json.message ?? "If that email exists, a reset link has been generated.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-100 w-full box-border" sx={{ py: 2, px: 1.5, sm: { py: 4, px: 2 } }}>
      <Card className="w-full max-w-md shadow-lg rounded-xl mx-2 sm:mx-4">
        <CardContent sx={{ p: 2.5, sm: { p: 4 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Forgot password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your email to request a reset link.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <Box component="form" onSubmit={onSubmit} className="flex flex-col gap-3">
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Submitting…" : "Send reset link"}
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
