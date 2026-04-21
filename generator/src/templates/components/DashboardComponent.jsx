import React, { useState, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, MenuItem, TextField, Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────

const REGIONS = ["All", "AF", "AM", "ANZ", "EU1", "EU2", "FEA", "INDO", "SME", "WKIO"];
const YEARS = ["All", "2026", "2027", "2028"];
const ROUTES = ["All", "BKK/HKG", "MLE/CMB", "JED", "LCA/MLA", "MRT", "SYD/MEL", "BKK/DAD", "MEL", "LHE", "MLE"];

const COLORS = ["#1565C0", "#B71C1C", "#009688", "#FF9800", "#7B1FA2", "#0D47A1", "#E91E63", "#4CAF50"];

const regionChartData = [
  { name: "INDO", value: 85 }, { name: "EU1", value: 72 },
  { name: "FEA", value: 60 },  { name: "SME", value: 55 },
  { name: "EU2", value: 40 },  { name: "ANZ", value: 35 },
  { name: "AW", value: 25 },   { name: "AF", value: 19 },
];

const statusPieData = [
  { name: "Active", value: 180, color: "#4CAF50" },
  { name: "Expired", value: 391, color: "#B71C1C" },
  { name: "Rejected", value: 45, color: "#FF9800" },
];

const monthlyTrendData = [
  { name: "Jan", active: 30, expired: 10, rejected: 5 },
  { name: "Feb", active: 45, expired: 20, rejected: 8 },
  { name: "Mar", active: 80, expired: 120, rejected: 12 },
  { name: "Apr", active: 60, expired: 100, rejected: 10 },
  { name: "May", active: 40, expired: 60, rejected: 6 },
  { name: "Jun", active: 25, expired: 40, rejected: 4 },
];

const tableRows = [
  { id: 1, route: "BKK/HKG", origin: "DXB", destination: "BKK", region: "FEA", year: "2026", status: "Expired", depDate: "2026-03-15", pax: 4 },
  { id: 2, route: "MLE/CMB", origin: "DXB", destination: "MLE", region: "INDO", year: "2026", status: "Active", depDate: "2026-04-10", pax: 2 },
  { id: 3, route: "JED", origin: "DXB", destination: "JED", region: "SME", year: "2026", status: "Expired", depDate: "2026-03-22", pax: 6 },
  { id: 4, route: "LCA/MLA", origin: "DXB", destination: "LCA", region: "EU1", year: "2027", status: "Rejected", depDate: "2027-01-05", pax: 3 },
  { id: 5, route: "SYD/MEL", origin: "DXB", destination: "SYD", region: "ANZ", year: "2026", status: "Expired", depDate: "2026-03-28", pax: 5 },
  { id: 6, route: "BKK/DAD", origin: "BKK", destination: "DAD", region: "FEA", year: "2026", status: "Active", depDate: "2026-05-12", pax: 2 },
  { id: 7, route: "MRT", origin: "DXB", destination: "MRT", region: "INDO", year: "2028", status: "Active", depDate: "2028-02-18", pax: 1 },
  { id: 8, route: "MEL", origin: "DXB", destination: "MEL", region: "ANZ", year: "2026", status: "Expired", depDate: "2026-04-01", pax: 3 },
  { id: 9, route: "LHE", origin: "DXB", destination: "LHE", region: "INDO", year: "2027", status: "Expired", depDate: "2027-03-14", pax: 7 },
  { id: 10, route: "MLE", origin: "DXB", destination: "MLE", region: "INDO", year: "2026", status: "Active", depDate: "2026-06-20", pax: 2 },
  { id: 11, route: "BKK/HKG", origin: "HKG", destination: "DXB", region: "FEA", year: "2026", status: "Expired", depDate: "2026-03-18", pax: 4 },
  { id: 12, route: "JED", origin: "JED", destination: "DXB", region: "SME", year: "2026", status: "Active", depDate: "2026-04-25", pax: 3 },
  { id: 13, route: "MLE/CMB", origin: "CMB", destination: "DXB", region: "INDO", year: "2027", status: "Rejected", depDate: "2027-05-08", pax: 2 },
  { id: 14, route: "SYD/MEL", origin: "SYD", destination: "DXB", region: "ANZ", year: "2028", status: "Active", depDate: "2028-01-30", pax: 5 },
  { id: 15, route: "LCA/MLA", origin: "MLA", destination: "DXB", region: "EU1", year: "2026", status: "Expired", depDate: "2026-03-10", pax: 1 },
  { id: 16, route: "BKK/HKG", origin: "DXB", destination: "HKG", region: "FEA", year: "2026", status: "Expired", depDate: "2026-04-14", pax: 6 },
  { id: 17, route: "MRT", origin: "MRT", destination: "DXB", region: "INDO", year: "2026", status: "Active", depDate: "2026-05-22", pax: 2 },
  { id: 18, route: "LHE", origin: "LHE", destination: "DXB", region: "INDO", year: "2026", status: "Expired", depDate: "2026-03-05", pax: 8 },
  { id: 19, route: "BKK/DAD", origin: "DAD", destination: "DXB", region: "FEA", year: "2027", status: "Rejected", depDate: "2027-06-15", pax: 3 },
  { id: 20, route: "MEL", origin: "MEL", destination: "DXB", region: "ANZ", year: "2026", status: "Expired", depDate: "2026-04-08", pax: 4 },
];

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "route", headerName: "Route", width: 130 },
  { field: "origin", headerName: "Origin", width: 100 },
  { field: "destination", headerName: "Destination", width: 120 },
  { field: "region", headerName: "Region", width: 100 },
  { field: "year", headerName: "Year", width: 80 },
  { field: "status", headerName: "Status", width: 100 },
  { field: "depDate", headerName: "Dep. Date", width: 130 },
  { field: "pax", headerName: "Pax", type: "number", width: 80 },
];

export default function DashboardComponent() {
  const [region, setRegion] = useState("All");
  const [year, setYear] = useState("All");
  const [route, setRoute] = useState("All");

  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (region !== "All" && row.region !== region) return false;
      if (year !== "All" && row.year !== year) return false;
      if (route !== "All" && row.route !== route) return false;
      return true;
    });
  }, [region, year, route]);

  const resetFilters = () => {
    setRegion("All");
    setYear("All");
    setRoute("All");
  };

  return (
    <Box sx={{ p: 3, marginTop: "60px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#01579b", color: "white" }}>
        <Typography variant="h6" fontWeight="bold">Analytics Dashboard</Typography>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth size="small" label="Region" value={region}
              onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth size="small" label="Year" value={year}
              onChange={(e) => setYear(e.target.value)}>
              {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth size="small" label="Route" value={route}
              onChange={(e) => setRoute(e.target.value)}>
              {ROUTES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" onClick={resetFilters} fullWidth>Reset Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Bar Chart - Region Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" align="center" gutterBottom fontWeight="bold">
              Records by Region
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={regionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1565C0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart - Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" align="center" gutterBottom fontWeight="bold">
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={statusPieData} dataKey="value" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={40} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Line Chart - Monthly Trend */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" align="center" gutterBottom fontWeight="bold">
              Monthly Trend
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="active" stroke="#4CAF50" strokeWidth={2} />
                <Line type="monotone" dataKey="expired" stroke="#B71C1C" strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke="#FF9800" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Records ({filteredRows.length})
        </Typography>
        <Box sx={{ height: 450, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 20]}
            checkboxSelection
            disableRowSelectionOnClick
            sortingOrder={["asc", "desc"]}
            sx={{
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: "bold" },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}