import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  Typography,
  Grid
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  getFyYearOptions,
  activateMonth,
  lockMonth
} from "./axios";
import { AdminTable } from "./adminTable";
import Dash from "./dash";

export const Admin = () => {
  const [fyYears, setFyYears] = useState([]);
  const [selectedFyYear, setSelectedFyYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [refreshTable, setRefreshTable] = useState(false); // For refreshing the AdminTable

  useEffect(() => {
    fetchFyYears();
  }, []);

  const fetchFyYears = async () => {
    try {
      const data = await getFyYearOptions();
      setFyYears(data);
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleActivateMonth = async () => {
    if (!selectedFyYear || !selectedMonth) {
      showSnackbar("Please select both Financial Year and Month", "error");
      return;
    }
    try {
      const formattedMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(selectedMonth);
      await activateMonth(selectedFyYear, formattedMonth);
      showSnackbar("Month activated successfully", "success");
      setRefreshTable((prev) => !prev);
    } catch (error) {
      showSnackbar("Failed to activate month", "error");
    }
  };


  const handleLockMonth = async () => {
    if (!selectedFyYear || !selectedMonth) {
      showSnackbar("Please select both Financial Year and Month", "error");
      return;
    }
    try {
      await lockMonth(selectedFyYear, selectedMonth);
      showSnackbar("Month locked successfully", "success");
      setRefreshTable((prev) => !prev); // Trigger AdminTable refresh
    } catch (error) {
      showSnackbar("Failed to lock month", "error");
    }
  };

  return (
    <div>
      <Dash />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 3, padding: 3, marginTop: '80px' }}>

          <Box
            sx={{
              width: { xs: "100%", md: "40%" },
              boxShadow: 3,
              p: 3,
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ backgroundColor: "#32348C", color: "white", p: 1, borderRadius: 1, textAlign: 'center' }}>
              Manage Financial Month
            </Typography>

            <Grid container spacing={2} style={{ marginTop: '1px' }}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={fyYears}
                  getOptionLabel={(option) => option.fy_name}
                  onChange={(event, value) => setSelectedFyYear(value?.fy_name || null)}
                  renderInput={(params) => <TextField {...params} label="Financial Year" variant="outlined" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DesktopDatePicker
                  views={["month"]}
                  label="Select Month"
                  value={selectedMonth}
                  onChange={(newValue) => setSelectedMonth(newValue)}
                  renderInput={(params) => <TextField {...params} variant="outlined" fullWidth />}
                />
              </Grid>

            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={handleActivateMonth}
                  disabled={!selectedFyYear || !selectedMonth}
                  style={{ borderRadius: '50px' }}
                >
                  Activate
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  startIcon={<LockIcon />}
                  onClick={handleLockMonth}
                  disabled={!selectedFyYear || !selectedMonth}
                  style={{ borderRadius: '50px' }}
                >
                  Lock
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Admin Table */}
        <AdminTable key={refreshTable} />

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </LocalizationProvider>
    </div>

  );


};
