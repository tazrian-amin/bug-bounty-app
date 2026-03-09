import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";

type VerifyBugCardProps = {
  verifierRemarks: string;
  verifying: boolean;
  onVerify: () => void;
  onRemarksChange: (value: string) => void;
};

export default function VerifyBugCard({
  verifierRemarks,
  verifying,
  onVerify,
  onRemarksChange,
}: VerifyBugCardProps) {
  return (
    <Card elevation={0} className="border border-slate-200">
      <CardContent className="p-4 sm:p-6">
        <Typography variant="h6" fontWeight={600} gutterBottom className="flex items-center gap-1">
          <VerifiedUserRoundedIcon fontSize="small" />
          Verify resolution
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Confirm the fix and add any remarks. Your verification will be recorded.
        </Typography>
        <TextField
          label="Verifier's remarks"
          multiline
          minRows={3}
          fullWidth
          value={verifierRemarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Confirm the fix or add feedback for the reporter…"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={onVerify}
          disabled={verifying || !verifierRemarks.trim()}
        >
          {verifying ? "Verifying…" : "Verify resolution"}
        </Button>
      </CardContent>
    </Card>
  );
}
