import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import type { BugComment } from "@/types/bug";

type BugDiscussionCardProps = {
  comments: BugComment[];
  commentBody: string;
  postingComment: boolean;
  onCommentBodyChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
};

export default function BugDiscussionCard({
  comments,
  commentBody,
  postingComment,
  onCommentBodyChange,
  onSubmitComment,
}: BugDiscussionCardProps) {
  return (
    <Card elevation={0} className="border border-slate-200">
      <CardContent className="p-4 sm:p-6">
        <Typography variant="h6" fontWeight={600} gutterBottom className="flex items-center gap-1">
          <ChatRoundedIcon fontSize="small" />
          Discussion ({comments.length})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ask for more details, share updates, or leave feedback for the reporter.
        </Typography>
        {comments.length > 0 && (
          <Box className="flex flex-col gap-3 mb-4">
            {comments.map((c) => (
              <Box
                key={c.id}
                className="bg-slate-50 p-3 rounded-lg border border-slate-100"
              >
                <Typography variant="caption" color="text.secondary">
                  {c.authorName} ({c.authorEmail}) · {new Date(c.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap mt-1">
                  {c.body}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        <Box component="form" onSubmit={onSubmitComment} className="flex flex-col gap-2">
          <TextField
            label="Add a comment"
            multiline
            minRows={2}
            fullWidth
            value={commentBody}
            onChange={(e) => onCommentBodyChange(e.target.value)}
            placeholder="Ask a question, add context, or give feedback…"
            disabled={postingComment}
          />
          <Button type="submit" variant="outlined" size="small" disabled={postingComment || !commentBody.trim()}>
            {postingComment ? "Posting…" : "Post comment"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
