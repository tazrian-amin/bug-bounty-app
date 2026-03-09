"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import type { Bug } from "@/types/bug";
import type { BugStatus } from "@/types/bug";
import { APP_NAMES, BUG_STATUS_LABELS, BUG_SEVERITY_LABELS } from "@/lib/bug-meta";

const SEVERITY_COLORS: Record<Bug["severity"], "error" | "warning" | "info" | "default"> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "info",
};

export default function DashboardPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [stats, setStats] = useState<Record<BugStatus, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [hunterFilter, setHunterFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<Bug["severity"] | "">("");
  const [statusFilter, setStatusFilter] = useState<BugStatus | "">("");
  const [appNameFilter, setAppNameFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const hunters = useMemo(
    () => [...new Set(bugs.map((b) => b.reportedBy))].sort(),
    [bugs]
  );
  const columnFilters = useMemo(() => {
    const filters: { id: string; value: string }[] = [];
    if (hunterFilter) filters.push({ id: "reportedBy", value: hunterFilter });
    if (severityFilter) filters.push({ id: "severity", value: severityFilter });
    if (statusFilter) filters.push({ id: "status", value: statusFilter });
    if (appNameFilter) filters.push({ id: "appName", value: appNameFilter });
    return filters;
  }, [hunterFilter, severityFilter, statusFilter, appNameFilter]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bugsRes, statsRes] = await Promise.all([
          fetch("/api/bugs"),
          fetch("/api/bugs?stats=true"),
        ]);
        if (bugsRes.ok) setBugs(await bugsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const columns = useMemo<ColumnDef<Bug>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => (
          <Typography variant="body2" fontWeight={500} noWrap className="max-w-[200px]">
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) =>
          new Date(String(getValue())).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ getValue }) => (
          <Chip
            size="small"
            label={BUG_SEVERITY_LABELS[getValue() as Bug["severity"]]}
            color={SEVERITY_COLORS[getValue() as Bug["severity"]]}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Chip
            size="small"
            variant="outlined"
            label={BUG_STATUS_LABELS[getValue() as BugStatus]}
          />
        ),
      },
      {
        accessorKey: "reportedBy",
        header: "Found by",
        cell: ({ getValue }) => (
          <Typography variant="body2" color="text.secondary">
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "appName",
        header: "App",
        filterFn: (row, _columnId, filterValue) =>
          (row.getValue("appName") as string) === filterValue,
        cell: ({ getValue }) => (
          <Typography variant="body2" color="text.secondary" noWrap className="max-w-[120px]">
            {(getValue() as string) || "—"}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            component={Link}
            href={`/dashboard/bugs/${row.original.id}`}
            size="small"
            variant="outlined"
            startIcon={<VisibilityRoundedIcon />}
          >
            Details
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: bugs,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: { pageIndex: page, pageSize: rowsPerPage },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnFilters) : updater;
      const reportedBy = next.find((f) => f.id === "reportedBy");
      const severity = next.find((f) => f.id === "severity");
      const status = next.find((f) => f.id === "status");
      const appName = next.find((f) => f.id === "appName");
      setHunterFilter(typeof reportedBy?.value === "string" ? reportedBy.value : "");
      setSeverityFilter(
        typeof severity?.value === "string" &&
        ["critical", "high", "medium", "low"].includes(severity.value)
          ? (severity.value as Bug["severity"])
          : ""
      );
      setStatusFilter(
        typeof status?.value === "string" &&
        ["new", "in_progress", "resolved", "verified", "closed"].includes(status.value)
          ? (status.value as BugStatus)
          : ""
      );
      setAppNameFilter(typeof appName?.value === "string" ? appName.value : "");
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  const hasActiveFilters =
    !!hunterFilter || !!severityFilter || !!statusFilter || !!appNameFilter || !!globalFilter;

  const clearFilters = () => {
    setHunterFilter("");
    setSeverityFilter("");
    setStatusFilter("");
    setAppNameFilter("");
    setGlobalFilter("");
    setPage(0);
  };

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "New",
        value: stats.new,
        icon: <BugReportRoundedIcon />,
        color: "primary.main",
      },
      {
        label: "In Progress",
        value: stats.in_progress,
        icon: <ScheduleRoundedIcon />,
        color: "warning.main",
      },
      {
        label: "Resolved",
        value: stats.resolved,
        icon: <CheckCircleRoundedIcon />,
        color: "success.main",
      },
      {
        label: "Verified",
        value: stats.verified,
        icon: <VerifiedUserRoundedIcon />,
        color: "success.dark",
      },
      {
        label: "Closed",
        value: stats.closed,
        icon: <ErrorRoundedIcon />,
        color: "text.secondary",
      },
    ];
  }, [stats]);

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[40vh]">
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-4 sm:gap-6 overflow-x-hidden">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Typography variant="h5" fontWeight={700} className="text-black text-lg sm:text-xl md:text-2xl">
          Bug Reports
        </Typography>
        <Button
          component={Link}
          href="/dashboard/report"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{
            bgcolor: "#ffc500",
            color: "#050404",
            textTransform: "uppercase",
            fontSize: "0.8125rem",
            fontWeight: 600,
            width: { xs: "100%", sm: "auto" },
            "&:hover": { bgcolor: "#e6b000" },
          }}
        >
          Report Bug
        </Button>
      </Box>

      <Box className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map(({ label, value, icon, color }) => (
          <Card key={label} elevation={0} className="border border-slate-200">
            <CardContent className="flex flex-row items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {value}
                </Typography>
              </Box>
              <Box sx={{ color }} className="opacity-80">
                {icon}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card elevation={0} className="border border-slate-200">
        <CardContent sx={{ p: 0 }}>
          <Box className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 border-b border-slate-200">
            <Typography variant="h6" fontWeight={600} className="text-base sm:text-lg">
              All bugs
            </Typography>
            <Box className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full sm:items-center">
              <TextField
                size="small"
                placeholder="Search…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: "100%", sm: 200 }, maxWidth: { sm: 220 } }}
              />
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 }, maxWidth: { sm: 180 } }}>
                <InputLabel id="hunter-filter-label">Hunter</InputLabel>
                <Select
                  labelId="hunter-filter-label"
                  label="Hunter"
                  value={hunterFilter}
                  onChange={(e) => {
                    setHunterFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {hunters.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 }, maxWidth: { sm: 160 } }}>
                <InputLabel id="severity-filter-label">Severity</InputLabel>
                <Select
                  labelId="severity-filter-label"
                  label="Severity"
                  value={severityFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSeverityFilter(
                      v && ["critical", "high", "medium", "low"].includes(v)
                        ? (v as Bug["severity"])
                        : ""
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {(Object.entries(BUG_SEVERITY_LABELS) as [Bug["severity"], string][]).map(
                    ([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 }, maxWidth: { sm: 160 } }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStatusFilter(
                      v && ["new", "in_progress", "resolved", "verified", "closed"].includes(v)
                        ? (v as BugStatus)
                        : ""
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {(Object.entries(BUG_STATUS_LABELS) as [BugStatus, string][]).map(
                    ([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 }, maxWidth: { sm: 180 } }}>
                <InputLabel id="app-filter-label">App</InputLabel>
                <Select
                  labelId="app-filter-label"
                  label="App"
                  value={appNameFilter}
                  onChange={(e) => {
                    setAppNameFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {APP_NAMES.map((app) => (
                    <MenuItem key={app} value={app}>
                      {app}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {hasActiveFilters && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearRoundedIcon />}
                  sx={{ flexShrink: 0 }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          </Box>
          <TableContainer sx={{ overflowX: "auto", overflowY: "visible" }}>
            <Table size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableCell key={h.id} sx={{ fontWeight: 600 }}>
                        {typeof h.column.columnDef.header === "string"
                          ? h.column.columnDef.header
                          : h.id}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" className="py-8 text-slate-500">
                      No bugs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} hover>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredRowCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Rows:"
            sx={{
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                fontSize: { xs: "0.8125rem", sm: "inherit" },
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
