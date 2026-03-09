import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

type ResolveBugCardProps = {
  resolvingDescription: string;
  resolving: boolean;
  onResolve: () => void;
  onDescriptionChange: (value: string) => void;
};

export default function ResolveBugCard({
  resolvingDescription,
  resolving,
  onResolve,
  onDescriptionChange,
}: ResolveBugCardProps) {
  return (
    <Card elevation={0} className="border border-slate-200">
      <CardContent className="p-4 sm:p-6">
        <Typography variant="h6" fontWeight={600} gutterBottom className="flex items-center gap-1">
          <CheckCircleRoundedIcon fontSize="small" />
          Resolve this bug
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Describe how the bug was fixed. This will mark the bug as resolved and record you as the resolver.
        </Typography>
        <TextField
          label="Resolving description"
          multiline
          minRows={3}
          fullWidth
          value={resolvingDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="How was this bug fixed?"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={onResolve}
          disabled={resolving || !resolvingDescription.trim()}
        >
          {resolving ? "Resolving…" : "Mark as Resolved"}
        </Button>
      </CardContent>
    </Card>
  );
}
