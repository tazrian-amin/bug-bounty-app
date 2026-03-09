"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import type { Bug } from "@/types/bug";
import type { BugSeverity } from "@/types/bug";
import type { BugStatus } from "@/types/bug";
import { BUG_SEVERITY_OPTIONS, BUG_STATUS_OPTIONS } from "@/lib/bug-meta";
import AppNameSelectField from "@/app/dashboard/components/AppNameSelectField";

type EditFormData = {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: BugSeverity;
  status: BugStatus;
  environment: string;
  version: string;
  locationRoute: string;
  appName: string;
};

export default function EditBugPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditFormData>({
    defaultValues: {
      title: "",
      description: "",
      stepsToReproduce: "",
      expectedResult: "",
      actualResult: "",
      severity: "medium",
      status: "new",
      environment: "",
      version: "",
      locationRoute: "",
      appName: "",
    },
  });

  useEffect(() => {
    fetch(`/api/bugs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBug(data);
        if (data.id) {
          reset({
            title: data.title ?? "",
            description: data.description ?? "",
            stepsToReproduce: data.stepsToReproduce ?? "",
            expectedResult: data.expectedResult ?? "",
            actualResult: data.actualResult ?? "",
            severity: data.severity ?? "medium",
            status: data.status ?? "new",
            environment: data.environment ?? "",
            version: data.version ?? "",
            locationRoute: data.locationRoute ?? "",
            appName: data.appName ?? "",
          });
        }
      })
      .catch(() => setBug(null))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const isReporter = !!session?.user?.email && !!bug && session.user.email === bug.reportedByEmail;

  useEffect(() => {
    if (!loading && bug && !isReporter) {
      router.replace(`/dashboard/bugs/${id}`);
    }
  }, [loading, bug, isReporter, id, router]);

  async function onSubmit(data: EditFormData) {
    const res = await fetch(`/api/bugs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? "Failed to update bug");
      return;
    }
    router.push(`/dashboard/bugs/${id}`);
  }

  if (loading) {
    return (
      <Box className="flex justify-center py-12">
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  if (!bug) {
    return (
      <Box>
        <Typography color="error">Bug not found.</Typography>
        <Button component={Link} href="/dashboard" startIcon={<ArrowBackRoundedIcon />}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!isReporter) {
    return null;
  }

  return (
    <Box className="max-w-2xl mx-auto w-full px-0 sm:px-2 overflow-x-hidden">
      <Box className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          component={Link}
          href={`/dashboard/bugs/${id}`}
          startIcon={<ArrowBackRoundedIcon />}
          size="small"
        >
          Back
        </Button>
      </Box>
      <Typography variant="h5" className="text-black" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
        Edit bug report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update the details below. Only the reporter can edit this report.
      </Typography>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <Box component="form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TextField
              label="Title"
              fullWidth
              required
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              label="Location / Route"
              fullWidth
              {...register("locationRoute")}
            />
            <Controller
              name="appName"
              control={control}
              render={({ field }) => (
                <AppNameSelectField
                  labelId="edit-app-name-label"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              required
              {...register("description", { required: "Description is required" })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <TextField
              label="Steps to Reproduce"
              fullWidth
              multiline
              rows={4}
              {...register("stepsToReproduce")}
            />
            <TextField
              label="Expected Result"
              fullWidth
              multiline
              rows={2}
              {...register("expectedResult")}
            />
            <TextField
              label="Actual Result"
              fullWidth
              multiline
              rows={2}
              {...register("actualResult")}
            />
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select {...field} label="Severity">
                      {BUG_SEVERITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {BUG_STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
            <TextField label="Environment (optional)" fullWidth {...register("environment")} />
            <TextField label="Version / Build (optional)" fullWidth {...register("version")} />
            <Box className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
              <Button component={Link} href={`/dashboard/bugs/${id}`} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
