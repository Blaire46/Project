import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ScienceIcon from "@mui/icons-material/Science";
import { fetchServices } from "../api";

// Optional: map service names to specific icons
const getIconForService = (serviceName) => {
  if (serviceName.includes("Radio")) return <ScienceIcon />;
  if (serviceName.includes("Oncologie")) return <LocalHospitalIcon />;
  if (serviceName.includes("Pédiatrie")) return <LocalHospitalIcon />;
  return <MedicalServicesIcon />; // default icon
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        // data is array of service names (strings)
        const serviceList = data.map((name, index) => ({
          id: index + 1,
          name: name,
          icon: getIconForService(name),
        }));
        setServices(serviceList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load services:", err);
        setError(err.message || "Impossible de charger les services");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des services...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Erreur : {error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* 🔵 NAVBAR */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 1 }}>
            Hospital Archive System
          </Typography>
          <Button color="inherit">Home</Button>
          <Button color="inherit">About</Button>
        </Toolbar>
      </AppBar>

      {/* 🟣 TITLE */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
          Choisir un Service
        </Typography>

        {/* 🟢 SERVICES GRID */}
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card
                onClick={() => {
                  // Save service name to localStorage as fallback
                  localStorage.setItem("selectedServiceName", service.name);
                  // Navigate with state
                  navigate(`/years/${service.id}`, {
                    state: { serviceName: service.name },
                  });
                }}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  padding: 2,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #42a5f5, #478ed1)",
                  color: "white",
                  transition: "0.4s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ fontSize: 60, mb: 2 }}>{service.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {service.name}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "#ffffff",
                      color: "#1976d2",
                      fontWeight: "bold",
                      borderRadius: "20px",
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                  >
                    Accéder
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