"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
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
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import type { BugCreate } from "@/types/bug";
import type { BugAttachment } from "@/types/bug";
import { BUG_SEVERITY_OPTIONS } from "@/lib/bug-meta";
import AppNameSelectField from "@/app/dashboard/components/AppNameSelectField";

type FormData = Omit<BugCreate, "attachments"> & {
  attachments: { file: File; id: string; name: string; type: string; size: number }[];
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReportBugPage() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    getValues,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      stepsToReproduce: "",
      expectedResult: "",
      actualResult: "",
      severity: "medium",
      environment: "",
      version: "",
      locationRoute: "",
      appName: "",
      attachments: [],
    },
  });

  const attachments = useWatch({ control, name: "attachments", defaultValue: [] });

  async function onSubmit(data: FormData) {
    const attachmentPayload: BugAttachment[] = [];
    for (const att of data.attachments) {
      const url = await fileToDataUrl(att.file);
      attachmentPayload.push({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        url,
      });
    }

    const payload: BugCreate = {
      ...data,
      attachments: attachmentPayload,
    };

    const res = await fetch("/api/bugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? "Failed to create bug");
      return;
    }
    const bug = await res.json();
    router.push(`/dashboard/bugs/${bug.id}`);
  }

  function addFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const current = getValues("attachments");
    const next = [
      ...current,
      ...Array.from(files).map((file) => ({
        file,
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    ];
    setValue("attachments", next);
    e.target.value = "";
  }

  function removeAttachment(id: string) {
    setValue(
      "attachments",
      getValues("attachments").filter((a: { id: string }) => a.id !== id)
    );
  }

  return (
    <Box className="max-w-2xl mx-auto w-full px-0 sm:px-2 overflow-x-hidden">
      <Box className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          component={Link}
          href="/dashboard"
          startIcon={<ArrowBackRoundedIcon />}
          size="small"
        >
          Back
        </Button>
      </Box>
      <Typography variant="h5" className="text-black" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
        Report a Bug
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, sm: { mb: 3 } }}>
        Fill in the details below. Attach screenshots or recordings to help with debugging.
      </Typography>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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
              placeholder="e.g. /inspections/completed/[:id] or Main layout"
              {...register("locationRoute")}
            />

            <Controller
              name="appName"
              control={control}
              render={({ field }) => (
                <AppNameSelectField
                  labelId="report-app-name-label"
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
              {...register("description", { required: "Description is required" })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <TextField
              label="Steps to Reproduce"
              fullWidth
              multiline
              rows={4}
              placeholder="1. Go to…&#10;2. Click…&#10;3. See error"
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
              <TextField label="Environment (optional)" fullWidth {...register("environment")} />
            </Box>

            <TextField
              label="Version / Build (optional)"
              fullWidth
              {...register("version")}
            />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Attachments (screenshots, recordings)
              </Typography>
              <input
                accept="image/*,.pdf,video/*"
                type="file"
                multiple
                id="attachments"
                className="hidden"
                onChange={addFiles}
              />
              <label htmlFor="attachments">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<AttachFileRoundedIcon />}
                  size="small"
                >
                  Add files
                </Button>
              </label>
              {attachments.length > 0 && (
                <List dense className="mt-2">
                  {attachments.map((att) => (
                    <ListItem
                      key={att.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => removeAttachment(att.id)}
                          size="small"
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={att.name}
                        secondary={`${(att.size / 1024).toFixed(1)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Box className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
              <Button
                type="button"
                onClick={() => router.push("/dashboard")}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || !isValid} className="w-full sm:w-auto sm:min-w-[160px]">
                {isSubmitting ? "Submitting…" : "Submit Bug Report"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
