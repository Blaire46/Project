import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('archiviste@example.com');
  const [password, setPassword] = useState('pass123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        navigate('/services');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f4f6f8' }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" textAlign="center" mb={3}>Hospital Archive System</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
          <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 3 }}>{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
      </Paper>
    </Box>
  );
}