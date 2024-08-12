import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Autocomplete, Box, Grid, Paper, Container, Typography } from '@mui/material';
import {
  getFormsByVehicleID,
  getFormsByHeadCatName,
  getFormsBySubCatName,
  getFormsByAmount,
  getFormsByFyYear,
  getFormsByMonth,
  getFormsByEmployeeID,
  getFormsByParticulars,
  getFormsByDate,
  getforms,
  getHeadCat,
  getSubCat,
  getMonth,
  getEmployee,
  getVehicle,
  getFyYear
} from './axios'; // Make sure to adjust the import path

const Table = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    vehicleId: '',
    headCategory: '',
    subCategory: '',
    amount: '',
    fyYear: '',
    month: '',
    employeeId: '',
    particulars: '',
    date: ''
  });

  const [headCats, setHeadCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [months, setMonths] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fyYears, setFyYears] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [headCatData, subCatData, monthData, employeeData, vehicleData, fyYearData] = await Promise.all([
          getHeadCat(),
          getSubCat(),
          getMonth(),
          getEmployee(),
          getVehicle(),
          getFyYear()
        ]);
        setHeadCats(headCatData);
        setSubCats(subCatData);
        setMonths(monthData);
        setEmployees(employeeData);
        setVehicles(vehicleData);
        setFyYears(fyYearData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleFilterChange = (e, value, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        let data = [];
        if (filters.vehicleId) {
          data = await getFormsByVehicleID(filters.vehicleId);
        } else if (filters.headCategory) {
          data = await getFormsByHeadCatName(filters.headCategory);
        } else if (filters.subCategory) {
          data = await getFormsBySubCatName(filters.subCategory);
        } else if (filters.amount) {
          data = await getFormsByAmount(filters.amount);
        } else if (filters.fyYear) {
          data = await getFormsByFyYear(filters.fyYear);
        } else if (filters.month) {
          data = await getFormsByMonth(filters.month);
        } else if (filters.employeeId) {
          data = await getFormsByEmployeeID(filters.employeeId);
        } else if (filters.particulars) {
          data = await getFormsByParticulars(filters.particulars);
        } else if (filters.date) {
          data = await getFormsByDate(filters.date);
        } else {
          // Fetch all forms if no filters are applied
          data = await getforms();
        }

        console.log('Fetched data:', data); // Debug: Check fetched data structure
        const formattedData = data.map((form, index) => ({
          id: index + 1,
          vehicleId: form.vehicles && form.vehicles[0] ? form.vehicles[0].vehicle_id : 'N/A',
          date: form.date,
          headCategory: form.head_cat && form.head_cat[0] ? form.head_cat[0].head_cat_name : 'N/A',
          subCategory: form.sub_cat && form.sub_cat[0] ? form.sub_cat[0].sub_cat_name : 'N/A',
          particulars: form.particulars,
          amount: form.amount,
        }));
        console.log('Formatted data:', formattedData); // Debug: Check formatted data
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchForms();
  }, [filters]);

  const columns = [
    { field: 'id', headerName: 'S.No', width: 100, headerClassName: 'column-header' },
    { field: 'vehicleId', headerName: 'VEHICLE ID', width: 150, headerClassName: 'column-header' },
    { field: 'date', headerName: 'DATE', width: 150, headerClassName: 'column-header' },
    { field: 'headCategory', headerName: 'HEAD CATEGORY', width: 200, headerClassName: 'column-header' },
    { field: 'subCategory', headerName: 'SUB CATEGORY', width: 200, headerClassName: 'column-header' },
    { field: 'particulars', headerName: 'PARTICULARS', width: 250, headerClassName: 'column-header' },
    { field: 'amount', headerName: 'AMOUNT', width: 150, headerClassName: 'column-header' },
  ];

  return (
    <div spacing={3} style={{padding:'50px',boxShadow:'px'}}>
            <Typography variant="h4" align="center" sx={{ backgroundColor: '#32348c', color: 'white', borderRadius: '5px',marginBottom:'10px' }}><b>Your Report</b></Typography>

      <Paper elevation={3} style={{ padding: 20, marginBottom: 20 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={vehicles.map((v) => v.vehicle_id)}
              renderInput={(params) => <TextField {...params} label="Vehicle ID" />}
              value={filters.vehicleId}
              onChange={(e, value) => handleFilterChange(e, value, 'vehicleId')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={headCats.map((hc) => hc.head_cat_name)}
              renderInput={(params) => <TextField {...params} label="Head Category" />}
              value={filters.headCategory}
              onChange={(e, value) => handleFilterChange(e, value, 'headCategory')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={subCats.map((sc) => sc.sub_cat_name)}
              renderInput={(params) => <TextField {...params} label="Sub Category" />}
              value={filters.subCategory}
              onChange={(e, value) => handleFilterChange(e, value, 'subCategory')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              name="amount"
              label="Amount"
              value={filters.amount}
              onChange={(e) => handleFilterChange(e, e.target.value, 'amount')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={fyYears.map((fy) => fy.fy_name)}
              renderInput={(params) => <TextField {...params} label="Financial Year" />}
              value={filters.fyYear}
              onChange={(e, value) => handleFilterChange(e, value, 'fyYear')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={months.map((m) => m.month_name)}
              renderInput={(params) => <TextField {...params} label="Month" />}
              value={filters.month}
              onChange={(e, value) => handleFilterChange(e, value, 'month')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={employees.map((emp) => emp.emp_id)}
              renderInput={(params) => <TextField {...params} label="Employee ID" />}
              value={filters.employeeId}
              onChange={(e, value) => handleFilterChange(e, value, 'employeeId')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              type="text"
              name="particulars"
              label="Particulars"
              value={filters.particulars}
              onChange={(e) => handleFilterChange(e, e.target.value, 'particulars')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              type="date"
              name="date"
              label="Date"
              value={filters.date}
              onChange={(e) => handleFilterChange(e, e.target.value, 'date')}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      <Box style={{ height: '100%', width: '100%' }}>
  <DataGrid
    rows={rows}
    columns={columns}
    pageSize={15}
    sx={{
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#32348c',
        color: '#1f1f1f', // Text color
        fontSize: '16px', // Font size
        fontWeight: 'bold', // Font weight for better visibility
      },
      '& .MuiDataGrid-cell': {
        padding: 'px',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 'bold', 
      },
    }}
  />
</Box>

</div>
  );
};

export default Table;
