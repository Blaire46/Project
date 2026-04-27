import {
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function DossiersPage() {
  const navigate = useNavigate();
  const { year } = useParams();

  const [search, setSearch] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);

  // 🔹 Fake data
  const rows = [
    { id: 1, cin: "123456", name: "Ahmed Ali", age: 45, status: "Active" },
    { id: 2, cin: "654321", name: "Sara Ben", age: 30, status: "Archived" },
    { id: 3, cin: "789123", name: "Mohamed Salah", age: 52, status: "Active" },
    { id: 4, cin: "456789", name: "Lina Karim", age: 27, status: "Archived" },
  ];

  // 🔍 Filter by CIN
  const filteredRows = rows.filter((row) =>
    row.cin.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 Columns
  const columns = [
    { field: "cin", headerName: "CIN", flex: 1 },
    { field: "name", headerName: "Nom", flex: 1 },
    { field: "age", headerName: "Age", flex: 0.5 },

    // 🎨 Status Chip
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Active" ? "success" : "default"}
        />
      ),
    },

    // 🎯 Actions column
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => navigate(`/dossier/${params.row.id}`)}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      
      {/* 🔵 Title */}
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: "bold", fontFamily: "Poppins" }}
      >
        Dossiers - {year}
      </Typography>

      {/* 🔍 Search */}
      <TextField
        label="Search by CIN"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 📊 DataGrid */}
      <Box sx={{ height: 500, backgroundColor: "white", borderRadius: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}

          // 🔥 Features
          checkboxSelection
          disableSelectionOnClick={false}

          // 📄 Pagination
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}

          // 🎯 Row click
          onRowClick={(params) =>
            navigate(`/dossier/${params.row.id}`)
          }

          // 🔥 Selection model
          onSelectionModelChange={(newSelection) =>
            setSelectionModel(newSelection)
          }

          // 🔧 Toolbar (search/export/filter)
          components={{
            Toolbar: GridToolbar,
          }}

          // 🎨 Styling
          sx={{
            border: "none",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1976d2",
              color: "white",
              fontWeight: "bold",
            },

            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#f9f9f9",
            },

            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#e3f2fd",
              cursor: "pointer",
            },
          }}
        />
      </Box>

      {/* 👇 Selected rows info */}
      <Typography sx={{ mt: 2 }}>
        Selected: {selectionModel.length} dossiers
      </Typography>
    </Box>
  );
}