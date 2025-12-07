import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const QualityMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    const filtered = metrics.filter(metric =>
      metric.metric_name?.toLowerCase().includes(search.toLowerCase()) ||
      metric.table_name?.toLowerCase().includes(search.toLowerCase()) ||
      metric.column_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMetrics(filtered);
  }, [search, metrics]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/quality-metrics');
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
        setFilteredMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircleIcon color="success" />;
      case 'FAIL':
        return <ErrorIcon color="error" />;
      case 'WARNING':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      PASS: 'success',
      FAIL: 'error',
      WARNING: 'warning'
    };
    
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={status}
        color={colors[status] || 'default'}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Métriques de Qualité
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historique des contrôles de qualité exécutés
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, table ou colonne..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Métrique</TableCell>
              <TableCell>Valeur</TableCell>
              <TableCell>Seuil</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Colonne</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMetrics.map((metric, index) => (
              <TableRow key={metric.id || index}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {metric.metric_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {metric.metric_value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {metric.threshold}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(metric.status)}</TableCell>
                <TableCell>
                  <Chip label={metric.table_name} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={metric.column_name} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(metric.check_date).toLocaleDateString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QualityMetrics;
