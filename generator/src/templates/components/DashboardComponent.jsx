import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, MenuItem, TextField, Button, CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { useMsal } from "@azure/msal-react";
import {  API_SCOPE_READ} from "../../config/authConfig";
import { fetchDashboardData } from "../../api/dashboardAPI";

const COLORS = ["#1565C0", "#B71C1C", "#009688", "#FF9800", "#7B1FA2", "#0D47A1", "#E91E63", "#4CAF50"];

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
  const { instance, accounts } = useMsal();
  const [region, setRegion] = useState("All");
  const [year, setYear] = useState("All");
  const [route, setRoute] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [regions, setRegions] = useState(["All"]);
  const [years, setYears] = useState(["All"]);
  const [routes, setRoutes] = useState(["All"]);
  const [tableRows, setTableRows] = useState([]);
  const [regionChartData, setRegionChartData] = useState([]);
  const [statusPieData, setStatusPieData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        let token = "";
        if (accounts.length > 0) {
          const response = await instance.acquireTokenSilent({
            scopes: [API_SCOPE_READ],
            account: accounts[0],
          });
          token = response.accessToken;
        }

        const data = await fetchDashboardData(token);
        setTableRows(data.tableRows || []);
        setRegionChartData(data.regionChartData || []);
        setStatusPieData(data.statusPieData || []);
        setMonthlyTrendData(data.monthlyTrendData || []);
        setRegions(["All", ...(data.filters?.regions || [])]);
        setYears(["All", ...(data.filters?.years || [])]);
        setRoutes(["All", ...(data.filters?.routes || [])]);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [instance, accounts]);

  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (region !== "All" && row.region !== region) return false;
      if (year !== "All" && row.year !== year) return false;
      if (route !== "All" && row.route !== route) return false;
      return true;
    });
  }, [region, year, route, tableRows]);

  const resetFilters = () => {
    setRegion("All");
    setYear("All");
    setRoute("All");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, marginTop: "60px" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error" variant="h6">Error loading dashboard</Typography>
          <Typography color="text.secondary">{error}</Typography>
        </Paper>
      </Box>
    );
  }

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
              {regions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth size="small" label="Year" value={year}
              onChange={(e) => setYear(e.target.value)}>
              {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth size="small" label="Route" value={route}
              onChange={(e) => setRoute(e.target.value)}>
              {routes.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" onClick={resetFilters} fullWidth>Reset Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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