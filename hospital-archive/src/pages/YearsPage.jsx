import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { services } from "../data/services";

export default function YearsPage() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const service = services.find(
  (s) => s.id === parseInt(serviceId)
);

const serviceName = service?.name || "Service";
  const years = [2020,2021,2022, 2023, 2024, 2025, 2026];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      
      {/* 🔵 NAVBAR */}
      <AppBar position="static" sx={{ background: "linear-gradient(135deg, #66bb6a, #43a047)" }}>
        <Toolbar>
          <Typography variant="h6">
  {serviceName} - Archive
</Typography>

          <Button color="inherit" onClick={() => navigate("/")}>
            <ArrowBackIcon sx={{ mr: 1 }} />
            Back
          </Button>
        </Toolbar>
      </AppBar>

      {/* 🟣 TITLE */}
      <Box sx={{ p: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#333",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Choisir une année
        </Typography>

        {/* 🟢 YEARS GRID */}
        <Grid container spacing={4}>
          {years.map((year) => (
            <Grid item xs={12} sm={6} md={4} key={year}>
              
              <Card
                onClick={() => navigate(`/dossiers/${year}`)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  padding: 2,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #66bb6a, #43a047)",
                  color: "white",
                  transition: "0.4s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardContent>
                  
                  <CalendarMonthIcon sx={{ fontSize: 60, mb: 2 }} />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {year}
                  </Typography>

                  {/* 🔘 BUTTON */}
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "#ffffff",
                      color: "#2e7d32",
                      fontWeight: "bold",
                      borderRadius: "20px",
                      "&:hover": {
                        backgroundColor: "#e8f5e9",
                      },
                    }}
                  >
                    Voir Dossiers
                  </Button>

                </CardContent>
              </Card>

            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}