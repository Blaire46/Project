// StatisticsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BarChartIcon from '@mui/icons-material/BarChart';
import { fetchServices, fetchYears, fetchPatients } from '../api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topDiagnoses, setTopDiagnoses] = useState([]);

  const COLORS = ['#1976d2', '#f57c00', '#2e7d32', '#9e9e9e', '#9c27b0', '#d32f2f'];

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const servicesData = await fetchServices();
        const yearsData = await fetchYears();
        setServices(servicesData || []);
        setYears(yearsData || []);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les options');
      }
    };
    loadOptions();
  }, []);

  const calculateDerivedData = (patientsList) => {
    // Top Doctors
    const doctorCount = {};
    patientsList.forEach(p => {
      if (p.medecin_traitant && p.medecin_traitant !== '') {
        doctorCount[p.medecin_traitant] = (doctorCount[p.medecin_traitant] || 0) + 1;
      }
    });
    const sortedDoctors = Object.entries(doctorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopDoctors(sortedDoctors);

    // Monthly admission data
    const monthly = {};
    patientsList.forEach(p => {
      if (p.date_admission) {
        const month = p.date_admission.substring(5, 7);
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthName = monthNames[parseInt(month) - 1];
        monthly[monthName] = (monthly[monthName] || 0) + 1;
      }
    });
    const monthlyArray = Object.entries(monthly).map(([month, count]) => ({ month, count }));
    setMonthlyData(monthlyArray);

    // Top Diagnoses
    const diagnosisCount = {};
    patientsList.forEach(p => {
      if (p.diagnostic && p.diagnostic !== '') {
        const diag = p.diagnostic.length > 20 ? p.diagnostic.substring(0, 20) + '...' : p.diagnostic;
        diagnosisCount[diag] = (diagnosisCount[diag] || 0) + 1;
      }
    });
    const sortedDiagnoses = Object.entries(diagnosisCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopDiagnoses(sortedDiagnoses);

    // Average length of stay (for hospitalized patients)
    const hospitalizedPatients = patientsList.filter(p => p.statut === 'hospitalisé' && p.date_admission);
    if (hospitalizedPatients.length > 0) {
      const today = new Date();
      let totalDays = 0;
      hospitalizedPatients.forEach(p => {
        const admissionDate = new Date(p.date_admission);
        const days = Math.floor((today - admissionDate) / (1000 * 60 * 60 * 24));
        totalDays += days > 0 ? days : 0;
      });
      const avgStay = (totalDays / hospitalizedPatients.length).toFixed(0);
      setStats(prev => ({ ...prev, avgStay }));
    }
  };

  const fetchDataAndCalculateStats = async () => {
    if (!selectedService || !selectedYear) {
      alert('Veuillez sélectionner un service et une année');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const allPatients = await fetchPatients(selectedService);
      const filteredByYear = allPatients.filter(patient => 
        patient.date_admission && patient.date_admission.startsWith(selectedYear)
      );
      
      const total = filteredByYear.length;
      const hospitalises = filteredByYear.filter(p => p.statut === 'hospitalisé').length;
      const suivis = filteredByYear.filter(p => p.statut === 'suivi').length;
      const sortis = filteredByYear.filter(p => p.statut === 'sorti').length;
      
      const baseStats = { total, hospitalises, suivis, sortis };
      
      setStats(baseStats);
      setPatients(filteredByYear);
      setFilteredPatients(filteredByYear);
      
      calculateDerivedData(filteredByYear);
      
      // Multi-year trend data (for the selected service)
      const trendYears = [2020, 2021, 2022, 2023, 2024, 2025];
      const trendDataArray = [];
      for (const year of trendYears) {
        const yearPatients = allPatients.filter(p => p.date_admission && p.date_admission.startsWith(year.toString()));
        trendDataArray.push({
          year: year.toString(),
          total: yearPatients.length,
          hospitalises: yearPatients.filter(p => p.statut === 'hospitalisé').length,
          suivis: yearPatients.filter(p => p.statut === 'suivi').length,
          sortis: yearPatients.filter(p => p.statut === 'sorti').length,
        });
      }
      setTrendData(trendDataArray);
      
      if (filteredByYear.length === 0) {
        setError(`Aucun patient trouvé pour ${selectedService} en ${selectedYear}`);
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Intelligent search (multi-field)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = patients.filter(p => 
        (p.nom && p.nom.toLowerCase().includes(term)) ||
        (p.prenom && p.prenom.toLowerCase().includes(term)) ||
        (p.num_carte_identite && p.num_carte_identite.includes(term)) ||
        (p.wilaya && p.wilaya.toLowerCase().includes(term)) ||
        (p.diagnostic && p.diagnostic.toLowerCase().includes(term)) ||
        (p.medecin_traitant && p.medecin_traitant.toLowerCase().includes(term))
      );
      setFilteredPatients(filtered);
    }
    setPage(0);
  }, [searchTerm, patients]);

  const exportToCSV = () => {
    if (filteredPatients.length === 0) return;
    
    const headers = ['Nom', 'Prénom', 'CIN', 'Wilaya', 'Statut', 'Date admission', 'Téléphone', 'Diagnostic', 'Médecin'];
    const rows = filteredPatients.map(p => [
      p.nom || '',
      p.prenom || '',
      p.num_carte_identite || '',
      p.wilaya || '',
      p.statut || '',
      p.date_admission || '',
      p.telephone || '',
      p.diagnostic || '',
      p.medecin_traitant || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `statistiques_${selectedService}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePDF = async () => {
    const element = document.getElementById('statistics-report');
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`statistiques_${selectedService}_${selectedYear}.pdf`);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statusData = stats ? [
    { name: 'Hospitalisés', value: stats.hospitalises, color: '#f57c00' },
    { name: 'Suivis', value: stats.suivis, color: '#2e7d32' },
    { name: 'Sortis', value: stats.sortis, color: '#9e9e9e' },
  ] : [];

 const statCards = [];
if (stats) {
  statCards.push(
    { label: 'Total patients', value: stats.total, bg: 'linear-gradient(135deg, #1976d2, #1565c0)', icon: '👥' },
    { label: 'Hospitalisés', value: stats.hospitalises, bg: 'linear-gradient(135deg, #f57c00, #e65100)', icon: '🏥' },
    { label: 'Suivis', value: stats.suivis, bg: 'linear-gradient(135deg, #2e7d32, #1b5e20)', icon: '🩺' },
    { label: 'Sortis', value: stats.sortis, bg: 'linear-gradient(135deg, #9e9e9e, #616161)', icon: '🚪' }
  );
  if (stats.avgStay) {
    statCards.push({ label: 'Durée moyenne séjour', value: `${stats.avgStay} jours`, bg: 'linear-gradient(135deg, #9c27b0, #7b1fa2)', icon: '📅' });
  }
}
  return (
    <Box sx={{ p: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          📊 Tableau de Bord Statistique
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/services')}>
          ← Retour aux services
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Filtres</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} label="Service">
                {services.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Année</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label="Année">
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={fetchDataAndCalculateStats} disabled={!selectedService || !selectedYear || loading} fullWidth sx={{ py: 1.5 }}>
              {loading ? <CircularProgress size={24} /> : '📈 Afficher les statistiques'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="info" sx={{ mb: 3 }}>{error}</Alert>}

      {stats && stats.total > 0 && (
        <div id="statistics-report">
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card, idx) => (
              <Grid item xs={6} sm={4} md={2.4} key={idx}>
                <Card sx={{ textAlign: 'center', background: card.bg, color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h3">{card.icon}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{card.value}</Typography>
                    <Typography variant="body2">{card.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Tabs for Charts */}
          <Paper sx={{ mb: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="📈 Tendances" />
              <Tab label="🥧 Statuts" />
              <Tab label="👨‍⚕️ Top Médecins" />
              <Tab label="📅 Admissions" />
              <Tab label="🩺 Top Diagnostics" />
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Évolution des patients ({selectedService})</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#1976d2" name="Total" />
                      <Line type="monotone" dataKey="hospitalises" stroke="#f57c00" name="Hospitalisés" />
                      <Line type="monotone" dataKey="suivis" stroke="#2e7d32" name="Suivis" />
                      <Line type="monotone" dataKey="sortis" stroke="#9e9e9e" name="Sortis" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Répartition par statut - {selectedYear}</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Top 5 Médecins par nombre de patients</Typography>
                  {topDoctors.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={topDoctors}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1976d2" name="Nombre de patients" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography>Aucune donnée médecin disponible</Typography>
                  )}
                </Box>
              )}
              
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Admissions par mois - {selectedYear}</Typography>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2e7d32" name="Nombre d'admissions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography>Aucune donnée mensuelle disponible</Typography>
                  )}
                </Box>
              )}
              
              {tabValue === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Top 5 Diagnostics</Typography>
                  {topDiagnoses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={topDiagnoses} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#9c27b0" name="Fréquence" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography>Aucune donnée diagnostic disponible</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>

          {/* Patient List with Intelligent Search */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                📋 Liste des patients - {selectedService} ({selectedYear})
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  size="small"
                  placeholder="🔍 Recherche intelligente (nom, CIN, diagnostic, médecin...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }}
                  sx={{ width: 350 }}
                />
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToCSV}>
                  CSV
                </Button>
                <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={generatePDF} color="error">
                  PDF
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prénom</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CIN</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Wilaya</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date admission</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Médecin</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>{patient.nom}</TableCell>
                      <TableCell>{patient.prenom}</TableCell>
                      <TableCell>{patient.num_carte_identite || '-'}</TableCell>
                      <TableCell>{patient.wilaya}</TableCell>
                      <TableCell>
                        <Chip label={patient.statut} color={patient.statut === 'hospitalisé' ? 'error' : patient.statut === 'suivi' ? 'warning' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>{patient.date_admission}</TableCell>
                      <TableCell>{patient.medecin_traitant || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {filteredPatients.length === 0 && (
                    <TableRow><TableCell colSpan={7} align="center">Aucun patient trouvé</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredPatients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
            />
          </Paper>
        </div>
      )}

      {!loading && stats && stats.total === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            📭 Aucun patient trouvé pour {selectedService} en {selectedYear}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}