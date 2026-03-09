import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import type { Bug, BugStatus } from "@/types/bug";
import {
  BUG_SEVERITY_LABELS,
  BUG_STATUS_LABELS,
  STATUSES_REQUIRING_FLOW,
  STATUSES_THAT_PREVENT_NEW,
} from "@/lib/bug-meta";

type BugHeaderStatusCardProps = {
  bug: Bug;
  status: BugStatus | "";
  updating: boolean;
  onStatusChange: (newStatus: BugStatus) => void;
};

export default function BugHeaderStatusCard({
  bug,
  status,
  updating,
  onStatusChange,
}: BugHeaderStatusCardProps) {
  return (
    <Box className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
      <Box className="min-w-0">
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }} className="wrap-break-word">
          {bug.title}
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <Chip
            size="small"
            label={BUG_SEVERITY_LABELS[bug.severity]}
            color={bug.severity === "critical" || bug.severity === "high" ? "error" : bug.severity === "medium" ? "warning" : "info"}
          />
          <Chip size="small" variant="outlined" label={BUG_STATUS_LABELS[bug.status]} />
        </Box>
      </Box>
      <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 160 }, width: { xs: "100%", md: "auto" } }} disabled={updating}>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e) => onStatusChange(e.target.value as BugStatus)}
        >
          {(Object.keys(BUG_STATUS_LABELS) as BugStatus[]).map((s) => (
            <MenuItem
              key={s}
              value={s}
              disabled={
                STATUSES_REQUIRING_FLOW.includes(s) ||
                (s === "new" && STATUSES_THAT_PREVENT_NEW.includes(bug.status))
              }
            >
              {BUG_STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
