"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AttachmentRoundedIcon from "@mui/icons-material/AttachmentRounded";
import type { Bug, BugComment } from "@/types/bug";
import type { BugStatus } from "@/types/bug";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BugDiscussionCard from "@/app/dashboard/bugs/components/BugDiscussionCard";
import ResolveBugCard from "@/app/dashboard/bugs/components/ResolveBugCard";
import VerifyBugCard from "@/app/dashboard/bugs/components/VerifyBugCard";
import BugHeaderStatusCard from "@/app/dashboard/bugs/components/BugHeaderStatusCard";
import BugMetaGrid from "@/app/dashboard/bugs/components/BugMetaGrid";

export default function BugDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<BugStatus | "">("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolvingDescription, setResolvingDescription] = useState("");
  const [resolving, setResolving] = useState(false);
  const [verifierRemarks, setVerifierRemarks] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [comments, setComments] = useState<BugComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const isReporter = !!session?.user?.email && !!bug && session.user.email === bug.reportedByEmail;
  const isResolvedOrClosed = bug?.status === "resolved" || bug?.status === "verified" || bug?.status === "closed";
  const isVerified = bug?.status === "verified" || !!bug?.verifiedAt;

  useEffect(() => {
    fetch(`/api/bugs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBug(data);
        setStatus(data.status ?? "");
      })
      .catch(() => setBug(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bugs/${id}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));
  }, [id, bug?.updatedAt]);

  async function handleStatusChange(newStatus: BugStatus) {
    setStatus(newStatus);
    setUpdating(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBug(updated);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteDialogOpen(false);
        router.push("/dashboard");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleResolve() {
    setResolving(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          resolvingDescription: resolvingDescription.trim() || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBug(updated);
        setStatus(updated.status);
        setResolvingDescription("");
      }
    } finally {
      setResolving(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifierRemarks: verifierRemarks.trim() || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBug(updated);
        setStatus(updated.status);
        setVerifierRemarks("");
      }
    } finally {
      setVerifying(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentBody.trim();
    if (!text || postingComment) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/bugs/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCommentBody("");
      }
    } finally {
      setPostingComment(false);
    }
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

  const sections = [
    { label: "Description", value: bug.description },
    { label: "Steps to Reproduce", value: bug.stepsToReproduce },
    { label: "Expected Result", value: bug.expectedResult },
    { label: "Actual Result", value: bug.actualResult },
  ];

  return (
    <Box className="flex flex-col gap-4 sm:gap-6 overflow-x-hidden">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Button
          component={Link}
          href="/dashboard"
          startIcon={<ArrowBackRoundedIcon />}
          size="small"
        >
          Back
        </Button>
        {isReporter && (
          <Box className="flex flex-wrap items-center gap-2">
            <Button
              component={Link}
              href={`/dashboard/bugs/${id}/edit`}
              variant="outlined"
              size="small"
              startIcon={<EditRoundedIcon />}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteRoundedIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete bug report?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            This will permanently delete this bug report. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Card elevation={0} className="border border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <BugHeaderStatusCard
            bug={bug}
            status={status}
            updating={updating}
            onStatusChange={handleStatusChange}
          />

          <BugMetaGrid bug={bug} />

          {isResolvedOrClosed && (bug.resolvedAt || bug.resolvedBy || bug.resolvingDescription) && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom className="flex items-center gap-1">
                <CheckCircleRoundedIcon fontSize="small" />
                Resolution
              </Typography>
              <Box className="bg-slate-50 p-3 rounded-lg space-y-2">
                {bug.resolvedAt && (
                  <Typography variant="body2">
                    <strong>Date resolved:</strong> {new Date(bug.resolvedAt).toLocaleString()}
                  </Typography>
                )}
                {bug.resolvedBy && (
                  <Typography variant="body2">
                    <strong>Resolved by:</strong> {bug.resolvedBy}
                    {bug.resolvedByEmail && ` (${bug.resolvedByEmail})`}
                  </Typography>
                )}
                {bug.resolvingDescription && (
                  <Typography variant="body2" className="whitespace-pre-wrap">
                    <strong>Resolving description:</strong>
                    <br />
                    {bug.resolvingDescription}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {isResolvedOrClosed && isVerified && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom className="flex items-center gap-1">
                <VerifiedUserRoundedIcon fontSize="small" />
                Verification
              </Typography>
              <Box className="bg-slate-50 p-3 rounded-lg space-y-2">
                {bug.verifiedAt && (
                  <Typography variant="body2">
                    <strong>Verification date:</strong> {new Date(bug.verifiedAt).toLocaleString()}
                  </Typography>
                )}
                {bug.verifiedBy && (
                  <Typography variant="body2">
                    <strong>Verified by:</strong> {bug.verifiedBy}
                    {bug.verifiedByEmail && ` (${bug.verifiedByEmail})`}
                  </Typography>
                )}
                {bug.verifierRemarks && (
                  <Typography variant="body2" className="whitespace-pre-wrap">
                    <strong>Verifier&apos;s remarks:</strong>
                    <br />
                    {bug.verifierRemarks}
                  </Typography>
                )}
              </Box>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {sections.map(({ label, value }) =>
            value ? (
              <Box key={label} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {label}
                </Typography>
                <Typography
                  variant="body2"
                  className="whitespace-pre-wrap bg-slate-50 p-3 rounded-lg"
                >
                  {value}
                </Typography>
              </Box>
            ) : null
          )}

          {bug.attachments && bug.attachments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom className="flex items-center gap-1">
                <AttachmentRoundedIcon fontSize="small" />
                Attachments
              </Typography>
              <Box className="flex flex-wrap gap-2 mt-2">
                {bug.attachments.map((att) => (
                  <Card key={att.id} variant="outlined" className="p-2">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-main no-underline"
                    >
                      {att.name}
                    </a>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {(att.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {!isResolvedOrClosed && (
        <ResolveBugCard
          resolvingDescription={resolvingDescription}
          resolving={resolving}
          onResolve={handleResolve}
          onDescriptionChange={setResolvingDescription}
        />
      )}

      {bug?.status === "resolved" && !isVerified && (
        <VerifyBugCard
          verifierRemarks={verifierRemarks}
          verifying={verifying}
          onVerify={handleVerify}
          onRemarksChange={setVerifierRemarks}
        />
      )}

      <BugDiscussionCard
        comments={comments}
        commentBody={commentBody}
        postingComment={postingComment}
        onCommentBodyChange={setCommentBody}
        onSubmitComment={handleAddComment}
      />
    </Box>
  );
}
