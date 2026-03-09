"use client";

import { createTheme } from "@mui/material/styles";
import { MiningSentryColors } from "@/lib/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: MiningSentryColors.primary500,
      light: "#ffd333",
      dark: "#cc9e00",
      contrastText: MiningSentryColors.black,
    },
    secondary: {
      main: MiningSentryColors.accent500,
      light: "#7bc4eb",
      dark: "#2a9ad4",
      contrastText: "#fff",
    },
    error: { main: "#c53030" },
    warning: { main: "#c05621" },
    success: { main: "#276749" },
    info: { main: MiningSentryColors.accent500 },
    text: {
      primary: MiningSentryColors.black,
      secondary: "#4a5568",
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  shape: { borderRadius: 8 },
});

export default theme;
