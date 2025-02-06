import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { getFyYear } from "./axios";

const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const AdminTable = () => {
  const [fyData, setFyData] = useState([]);

  useEffect(() => {
    const fetchFyData = async () => {
      try {
        const data = await getFyYear();
        setFyData(data);
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };
    fetchFyData();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: "#32348C" }}>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: "bold", color: "white", backgroundColor: "#32348C" }}>
              Financial Year
            </TableCell>
            {monthsList.map((month) => (
              <TableCell key={month} align="center" sx={{ fontWeight: "bold", color: "white", backgroundColor: "#32348C" }}>
                {month}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {fyData.map((fy) => (
            <TableRow key={fy._id}>
              <TableCell align="center">
                <Typography sx={{ color: fy.fy_id ? "#4caf50" : "#f44336", fontWeight: "bold" }}>
                  {fy.fy_name}
                </Typography>
              </TableCell>
              {monthsList.map((month) => {
                const foundMonth = fy.months.find((m) => m.month_name === month);
                const isActive = foundMonth && foundMonth.month_id;
                return (
                  <TableCell key={month} align="center">
                    <Typography sx={{ color: isActive ? "#4caf50" : "#f44336", fontWeight: "bold" }}>
                      {isActive ? "✔" : "✖"}
                    </Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  
};
