import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Bug } from "@/types/bug";

type BugMetaGridProps = {
  bug: Bug;
};

export default function BugMetaGrid({ bug }: BugMetaGridProps) {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
      <Box>
        <Typography variant="caption" color="text.secondary">
          Reported by
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {bug.reportedBy} ({bug.reportedByEmail})
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Created
        </Typography>
        <Typography variant="body2">
          {new Date(bug.createdAt).toLocaleString()}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Last updated
        </Typography>
        <Typography variant="body2">
          {new Date(bug.updatedAt).toLocaleString()}
        </Typography>
      </Box>
      {bug.locationRoute && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Location / Route
          </Typography>
          <Typography variant="body2">
            {bug.locationRoute}
          </Typography>
        </Box>
      )}
      {bug.appName && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            App name
          </Typography>
          <Typography variant="body2">
            {bug.appName}
          </Typography>
        </Box>
      )}
      {(bug.environment || bug.version) && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Environment / Version
          </Typography>
          <Typography variant="body2">
            {[bug.environment, bug.version].filter(Boolean).join(" · ")}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
