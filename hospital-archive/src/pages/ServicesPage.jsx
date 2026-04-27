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
import { useNavigate } from "react-router-dom";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ScienceIcon from "@mui/icons-material/Science";

export default function ServicesPage() {
  const navigate = useNavigate();

  const services = [
    { id: 1, name: "Hématologie", icon: <MedicalServicesIcon /> },
    { id: 2, name: "Radiothérapie", icon: <ScienceIcon /> },
    { id: 3, name: "Oncologie", icon: <LocalHospitalIcon /> },
    { id: 4, name: "Médecine Nucléaire", icon: <MedicalServicesIcon /> },
    { id: 5, name: "Pédiatrie", icon: <LocalHospitalIcon /> },
    { id: 6, name: "L’Imagerie", icon: <MedicalServicesIcon /> },
  ];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      
      {/* 🔵 NAVBAR */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 1 }}
          >
            Hospital Archive System
          </Typography>

          <Button color="inherit">Home</Button>
          <Button color="inherit">About</Button>
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
          Choisir un Service
        </Typography>

        {/* 🟢 SERVICES GRID */}
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              
              <Card
                onClick={() =>
                   navigate(`/years/${service.id}`, {
                     state: { serviceName: service.name },
                 })
             }
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
                  
                  <Box sx={{ fontSize: 60, mb: 2 }}>
                    {service.icon}
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {service.name}
                  </Typography>

                  {/* 🔘 BUTTON */}
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "#ffffff",
                      color: "#1976d2",
                      fontWeight: "bold",
                      borderRadius: "20px",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                      },
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