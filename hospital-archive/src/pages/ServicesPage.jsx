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
import BarChartIcon from "@mui/icons-material/BarChart";
import { fetchServices } from "../api";

const getIconForService = (serviceName) => {
  if (serviceName.includes("Radio")) return <ScienceIcon />;
  if (serviceName.includes("Oncologie")) return <LocalHospitalIcon />;
  if (serviceName.includes("Pédiatrie")) return <LocalHospitalIcon />;
  return <MedicalServicesIcon />;
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchServices()
      .then((data) => {
        const serviceList = data.map((name, index) => ({
          id: index + 1,
          name: name,
          icon: getIconForService(name),
        }));
        setServices(serviceList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
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
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Hospital Archive System
          </Typography>
          <Button color="inherit" onClick={() => navigate("/services")}>Home</Button>
          {/* Statistics button - visible for all roles but will redirect */}
          <Button color="inherit" onClick={() => navigate("/statistiques")} startIcon={<BarChartIcon />}>
            Statistiques
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Choisir un Service
        </Typography>

        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card
                onClick={() => {
                  localStorage.setItem("selectedServiceName", service.name);
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