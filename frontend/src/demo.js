import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Autocomplete, Grid, Box, Typography, Chip } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { postform, getHeadCat, getSubCat, getMonth, getDepartment, getEmployee, getVehicle, getFyYear } from './axios';
import axios from 'axios';

const Form = ({ handleClose }) => {
  const [fy_year, setFyYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [head_cat, setHeadCat] = useState(null);
  const [sub_cat, setSubCat] = useState(null);
  const [date, setDate] = useState(null);
  const [received_by, setReceivedBy] = useState([]);
  const [particulars, setParticulars] = useState(null);
  const [bill_no, setBillNo] = useState(null);
  const [departments, setDepartments] = useState(null);
  const [amount, setAmount] = useState(null);
  const [vehicles, setVehicles] = useState(null);

  const [headCats, setHeadCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [months, setMonths] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [fyYears, setFyYears] = useState([]);

  const [isSubCatDisabled, setIsSubCatDisabled] = useState(true);
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(true);
  const [isVehicleDisabled, setIsVehicleDisabled] = useState(true);

  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headCatData = await getHeadCat();
        setHeadCats(headCatData);

        const subCatData = await getSubCat();
        setSubCats(subCatData);

        const monthData = await getMonth();
        setMonths(monthData);

        const departmentData = await getDepartment();
        setDepartmentsList(departmentData);

        const employeeData = await getEmployee();
        setEmployees(employeeData);

        const vehicleData = await getVehicle();
        setVehiclesList(vehicleData);

        const fyYearData = await getFyYear();
        setFyYears(fyYearData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sub_cat) {
      const subCatSplId = sub_cat.spl_id;
      const departmentEnabled = departmentsList.some(dept => dept.spl_id === subCatSplId);
      const vehicleEnabled = vehiclesList.some(vehicle => vehicle.spl_id === subCatSplId);

      setIsDepartmentDisabled(!departmentEnabled);
      setIsVehicleDisabled(!vehicleEnabled);

      if (!departmentEnabled) {
        setDepartments(null);
      }

      if (!vehicleEnabled) {
        setVehicles(null);
      }
    }
  }, [sub_cat, departmentsList, vehiclesList]);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const formData = new FormData();
    const formValues = {
      fy_year: fy_year?.fy_name || '',
      month: month?.month_name || '',
      head_cat: head_cat || '', // Store the entire value
      sub_cat: sub_cat || '', // Store the entire value
      date,
      received_by: received_by, // Store the entire value
      particulars,
      bill_no,
      departments: departments || '', // Store the entire value
      amount,
      vehicles: vehicles || '', // Store the entire value
    };
  
    // Append form fields to formData
    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });
  
    // Append files to formData
    files.forEach(file => {
      formData.append('files', file);
    });
  
    try {
      const result = await axios.post('http://localhost:1111/postform', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(result.data.message);
    } catch (error) {
      console.error('Error posting form:', error);
      alert('Error adding form: ' + error.message);
    }
  };
  


  const handleClear = () => {
    setFyYear(null);
    setMonth(null);
    setHeadCat(null);
    setSubCat(null);
    setDate(null);
    setReceivedBy([]);
    setParticulars('');
    setBillNo(null);
    setDepartments(null);
    setAmount('');
    setVehicles(null);
    setIsSubCatDisabled(true);
    setIsDepartmentDisabled(true);
    setIsVehicleDisabled(true);
    setFiles([]);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleFileRemove = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          width: '60%',
          bgcolor: 'background.paper',
          borderRadius: '50px'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom style={{ backgroundColor: '#32348c', color: '#fff', textAlign: 'center', borderRadius: '50px' }}>
          <b>REPORT</b>
        </Typography>
        <Grid container spacing={2}>
          {/* Fiscal Year, Month, and Selected Date */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Autocomplete
                  options={fyYears}
                  getOptionLabel={(option) => option.fy_name}
                  value={fy_year}
                  onChange={(e, newValue) => setFyYear(newValue)}
                  renderInput={(params) => <TextField {...params} label="Fiscal Year" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                />
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  options={months}
                  getOptionLabel={(option) => option.month_name}
                  value={month}
                  onChange={(e, newValue) => setMonth(newValue)}
                  renderInput={(params) => <TextField {...params} label="Month" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Head Category and Sub Category */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Autocomplete
                  options={headCats}
                  getOptionLabel={(option) => option.head_cat_name}
                  value={head_cat}
                  onChange={(e, newValue) => {
                    setHeadCat(newValue);
                    setIsSubCatDisabled(newValue === null);
                    if (newValue === null) {
                      setSubCat(null);
                      setDepartments(null);
                      setVehicles(null);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Head Category" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  options={subCats}
                  getOptionLabel={(option) => option.sub_cat_name}
                  value={sub_cat}
                  onChange={(e, newValue) => setSubCat(newValue)}
                  renderInput={(params) => <TextField {...params} label="Sub Category" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                  disabled={isSubCatDisabled}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Departments and Vehicles */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Autocomplete
                  options={departmentsList}
                  getOptionLabel={(option) => option.dept_full_name}
                  value={departments}
                  onChange={(e, newValue) => setDepartments(newValue)}
                  renderInput={(params) => <TextField {...params} label="Departments" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                  disabled={isDepartmentDisabled}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  options={vehiclesList}
                  getOptionLabel={(option) => option.vehicle_name}
                  value={vehicles}
                  onChange={(e, newValue) => setVehicles(newValue)}
                  renderInput={(params) => <TextField {...params} label="Vehicles" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                  disabled={isVehicleDisabled}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Received By and Particulars */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Autocomplete
                  multiple
                  options={employees}
                  getOptionLabel={(option) => option.emp_name}
                  value={received_by}
                  onChange={(e, newValue) => setReceivedBy(newValue)}
                  renderInput={(params) => <TextField {...params} label="Received By" sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }} />}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  label="Particulars"
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Bill Number and Amount */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  label="Bill Number"
                  value={bill_no}
                  onChange={(e) => setBillNo(e.target.value)}
                  sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  label="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* File Upload and Display */}
          <Grid item xs={12}>
            <Box
              {...getRootProps()}
              sx={{
                borderRadius: '50px',
                p: 1,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#1565c0',
                transition: 'background-color 0.3s, box-shadow 0.3s',
                '&:hover': {
                  backgroundColor: '#1e88e5',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <input {...getInputProps()} />
              <Typography style={{ color: '#ffff' }} variant="body1">UPLOAD FILE</Typography>
            </Box>
            <Box sx={{ mt: '15px', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => handleFileRemove(file.name)}
                  color="primary"
                />
              ))}
            </Box>
          </Grid>

          {/* Submit and Clear Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="submit" variant="contained" color="success" sx={{ flexGrow: 1, mr: 1,borderRadius:'50px' }}>
                Submit
              </Button>
              <Button variant="contained" color="error" onClick={handleClear} sx={{ flexGrow: 1,borderRadius:'50px' }}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Form;