
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Button,
  Modal,
  Paper,
  Grid as MuiGrid,
  MenuItem,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from '@mui/icons-material/Add';
import { fetchPatients } from '../api';

export default function DossiersPage() {
  const { year } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const serviceName = location.state?.serviceName || localStorage.getItem('selectedServiceName');
  
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    wilaya: '',
    num_carte_identite: '',
    telephone: '',
    diagnostic: '',
    medecin_traitant: '',
    statut: 'hospitalisé',
    service: serviceName || '',
    date_admission: new Date().toISOString().slice(0,10)
  });

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const loadPatients = () => {
    if (!serviceName) return;
    fetchPatients(serviceName)
      .then(patients => {
        const filtered = patients.filter(p => p.date_admission && p.date_admission.startsWith(year));
        const mapped = filtered.map(p => ({
          id: p.id,
          cin: p.num_carte_identite || '',
          name: `${p.nom} ${p.prenom}`,
          age: calculateAge(p.date_naissance),
          status: p.statut,
        }));
        setRows(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Erreur lors du chargement des patients.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!serviceName) {
      setError('Aucun service sélectionné. Retournez à la page des services.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    loadPatients();
  }, [serviceName, year]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPatient = async () => {
    console.log('Add button clicked');
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    
    if (!token) {
      alert('Vous n\'êtes pas authentifié. Veuillez vous reconnecter.');
      return;
    }

    // Basic validation
    if (!formData.nom || !formData.prenom || !formData.wilaya || !formData.service || !formData.date_admission) {
      alert('Veuillez remplir tous les champs obligatoires: Nom, Prénom, Wilaya, Service, Date admission');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (response.ok) {
        setOpenModal(false);
        // Reset form
        setFormData({
          nom: '',
          prenom: '',
          date_naissance: '',
          wilaya: '',
          num_carte_identite: '',
          telephone: '',
          diagnostic: '',
          medecin_traitant: '',
          statut: 'hospitalisé',
          service: serviceName || '',
          date_admission: new Date().toISOString().slice(0,10)
        });
        // Reload patients
        loadPatients();
        alert('Patient ajouté avec succès!');
      } else {
        alert(`Erreur ${response.status}: ${responseData.error || 'Impossible d\'ajouter le patient'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Erreur réseau: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRows = rows.filter(row =>
    row.cin.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "cin", headerName: "CIN", flex: 1 },
    { field: "name", headerName: "Nom", flex: 1 },
    { field: "age", headerName: "Age", flex: 0.5 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value} color={params.value === "hospitalisé" ? "success" : "default"} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => navigate(`/dossier/${params.row.id}`)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des dossiers...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/services')}>
          Retour aux services
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Dossiers - {year} ({serviceName})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
          Ajouter patient
        </Button>
      </Box>

      <TextField
        label="Search by CIN"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Box sx={{ height: 500, backgroundColor: "white", borderRadius: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          checkboxSelection
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          onRowClick={(params) => navigate(`/dossier/${params.row.id}`)}
          components={{ Toolbar: GridToolbar }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1976d2", color: "white" },
          }}
        />
      </Box>
      <Typography sx={{ mt: 2 }}>Total: {filteredRows.length} dossiers</Typography>

      {/* Add Patient Modal */}
      <Modal open={openModal} onClose={() => !submitting && setOpenModal(false)}>
        <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 550, maxWidth: '90%', p: 4, maxHeight: '90vh', overflow: 'auto' }}>
          <Typography variant="h6" mb={2}>Ajouter un nouveau patient</Typography>
          <MuiGrid container spacing={2}>
            <MuiGrid item xs={6}><TextField fullWidth label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} required /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} required /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Date naissance" name="date_naissance" type="date" value={formData.date_naissance} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Wilaya" name="wilaya" value={formData.wilaya} onChange={handleInputChange} required /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="CIN" name="num_carte_identite" value={formData.num_carte_identite} onChange={handleInputChange} /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone} onChange={handleInputChange} /></MuiGrid>
            <MuiGrid item xs={12}><TextField fullWidth label="Diagnostic" name="diagnostic" value={formData.diagnostic} onChange={handleInputChange} /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Médecin traitant" name="medecin_traitant" value={formData.medecin_traitant} onChange={handleInputChange} /></MuiGrid>
            <MuiGrid item xs={6}>
              <TextField
                select
                fullWidth
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
              >
                <MenuItem value="hospitalisé">Hospitalisé</MenuItem>
                <MenuItem value="suivi">Suivi</MenuItem>
                <MenuItem value="sorti">Sorti</MenuItem>
              </TextField>
            </MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Service" name="service" value={formData.service} onChange={handleInputChange} required helperText="ex: Oncologie" /></MuiGrid>
            <MuiGrid item xs={6}><TextField fullWidth label="Date admission" name="date_admission" type="date" value={formData.date_admission} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required /></MuiGrid>
          </MuiGrid>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" onClick={() => setOpenModal(false)} disabled={submitting}>Annuler</Button>
            <Button variant="contained" onClick={handleAddPatient} disabled={submitting}>
              {submitting ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
}