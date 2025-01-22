import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Chip,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FiscalForm = () => {
  const [bills, setBills] = useState([
    { bill_no: "", amount: "", files: [] }, // Default bill
  ]);

  const handleBillChange = (index, field, value) => {
    const updatedBills = [...bills];
    updatedBills[index][field] = value;
    setBills(updatedBills);
  };

  const handleFileUpload = (index, files) => {
    const updatedBills = [...bills];
    const fileNames = Array.from(files)
      .filter((file) => /\.(png|jpe?g|pdf)$/i.test(file.name)) // Validate file type
      .map((file) => file.name);

    if (fileNames.length === 0) {
      alert("Only PNG, JPEG, JPG, and PDF files are allowed.");
      return;
    }

    updatedBills[index].files = [...updatedBills[index].files, ...fileNames];
    setBills(updatedBills);
  };

  const handleFileDelete = (billIndex, fileIndex) => {
    const updatedBills = [...bills];
    updatedBills[billIndex].files.splice(fileIndex, 1);
    setBills(updatedBills);
  };

  const addNewBill = () => {
    setBills([...bills, { bill_no: "", amount: "", files: [] }]);
  };

  const removeBill = (index) => {
    const updatedBills = [...bills];
    updatedBills.splice(index, 1);
    setBills(updatedBills);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", { bills });
    // Add form submission logic here
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Fiscal Data Form
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Wrapper for all bills */}
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          {bills.map((bill, index) => (
            <Box key={index} mb={3}>
              <Grid container spacing={2} alignItems="center">
                {/* Bill Number */}
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Bill Number"
                    value={bill.bill_no}
                    onChange={(e) => handleBillChange(index, "bill_no", e.target.value)}
                    required
                  />
                </Grid>
                {/* Amount */}
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={bill.amount}
                    onChange={(e) => handleBillChange(index, "amount", e.target.value)}
                    required
                  />
                </Grid>
                {/* Upload Files */}
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                  >
                    Upload Files
                    <input
                      type="file"
                      multiple
                      hidden
                      accept=".png,.jpeg,.jpg,.pdf"
                      onChange={(e) => handleFileUpload(index, e.target.files)}
                    />
                  </Button>
                </Grid>
              </Grid>

              {/* Files Chips */}
              <Box mt={1}>
                {bill.files.length > 0 ? (
                  bill.files.map((file, fileIndex) => (
                    <Chip
                      key={fileIndex}
                      label={file}
                      onDelete={() => handleFileDelete(index, fileIndex)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No files uploaded.
                  </Typography>
                )}
              </Box>

              {/* Divider */}
              <Divider sx={{ my: 2 }} />

              {/* Remove Bill Button */}
              <Box textAlign="right">
                <IconButton
                  onClick={() => removeBill(index)}
                  disabled={bills.length === 1} // Prevent removing the last bill
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          {/* Add New Bill Button */}
          <Box textAlign="center">
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={addNewBill}
              sx={{ mb: 2 }}
            >
              Add New Bill
            </Button>
          </Box>
        </Paper>

        {/* Submit Button */}
        <Box textAlign="center" mt={3}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default FiscalForm;
