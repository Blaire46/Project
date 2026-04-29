
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function DossierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous n\'êtes pas authentifié.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}: Patient non trouvé`);
      const data = await response.json();
      setPatient(data);
      setEditData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditData({ ...patient });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({ ...patient });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: 'Non authentifié', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erreur lors de la mise à jour');
      }
      const updated = await response.json();
      setPatient(updated);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Dossier mis à jour avec succès', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement du dossier...</Typography>
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

  if (!patient) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Aucun patient trouvé avec cet ID.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Box>
    );
  }

  const data = editMode ? editData : patient;

  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        {!editMode ? (
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditClick}>
            Modifier
          </Button>
        ) : (
          <Box>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancelEdit} sx={{ mr: 1 }} disabled={saving}>
              Annuler
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Box>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Dossier médical
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          ID: {patient.id}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          {/* Personal information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Informations personnelles</Typography>
                <TextField
                  fullWidth label="Nom" name="nom" value={data.nom || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode} required
                />
                <TextField
                  fullWidth label="Prénom" name="prenom" value={data.prenom || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode} required
                />
                <TextField
                  fullWidth label="Date de naissance" name="date_naissance"
                  type="date" value={formatDateForInput(data.date_naissance)}
                  onChange={handleChange} margin="normal" disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth label="Wilaya" name="wilaya" value={data.wilaya || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode} required
                />
                <TextField
                  fullWidth label="CIN" name="num_carte_identite" value={data.num_carte_identite || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode}
                />
                <TextField
                  fullWidth label="Téléphone" name="telephone" value={data.telephone || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Medical information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Informations médicales</Typography>
                <TextField
                  fullWidth label="Service" name="service" value={data.service || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode} required
                />
                <TextField
                  fullWidth label="Médecin traitant" name="medecin_traitant" value={data.medecin_traitant || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode}
                />
                <TextField
                  fullWidth label="Diagnostic" name="diagnostic" value={data.diagnostic || ''} onChange={handleChange}
                  margin="normal" disabled={!editMode} multiline rows={2}
                />
                <TextField
                  select fullWidth label="Statut" name="statut" value={data.statut || 'hospitalisé'} onChange={handleChange}
                  margin="normal" disabled={!editMode}
                >
                  <MenuItem value="hospitalisé">Hospitalisé</MenuItem>
                  <MenuItem value="suivi">Suivi</MenuItem>
                  <MenuItem value="sorti">Sorti</MenuItem>
                </TextField>
                <TextField
                  fullWidth label="Date d'admission" name="date_admission"
                  type="date" value={formatDateForInput(data.date_admission)}
                  onChange={handleChange} margin="normal" disabled={!editMode}
                  InputLabelProps={{ shrink: true }} required
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}