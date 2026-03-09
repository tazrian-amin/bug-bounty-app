import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { APP_NAMES } from "@/lib/bug-meta";

type AppNameSelectFieldProps = {
  labelId: string;
  value: string;
  onChange: (nextValue: string) => void;
};

export default function AppNameSelectField({
  labelId,
  value,
  onChange,
}: AppNameSelectFieldProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId} shrink>
        App name
      </InputLabel>
      <Select
        labelId={labelId}
        label="App name"
        value={value}
        displayEmpty
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">
          <em>Select app</em>
        </MenuItem>
        {APP_NAMES.map((app) => (
          <MenuItem key={app} value={app}>
            {app}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
