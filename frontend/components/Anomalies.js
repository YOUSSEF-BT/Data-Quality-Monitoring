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
  IconButton,
  Tooltip
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      const response = await fetch('/api/anomalies');
      const data = await response.json();
      if (data.success) {
        setAnomalies(data.data);
      }
    } catch (error) {
      console.error('Erreur de chargement des anomalies:', error);
    }
  };

  const updateAnomalyStatus = async (id, status) => {
    try {
      const response = await fetch('/api/update-anomaly-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAnomalies();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const getSeverityChip = (severity) => {
    const colors = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'error'
    };
    return (
      <Chip
        label={severity}
        color={colors[severity] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Anomalies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Liste des anomalies détectées dans les données
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Colonne</TableCell>
              <TableCell>ID Enregistrement</TableCell>
              <TableCell>Valeur Anormale</TableCell>
              <TableCell>Valeur Attendue</TableCell>
              <TableCell>Sévérité</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anomalies.map((anomaly, index) => (
              <TableRow key={anomaly.id || index}>
                <TableCell>{anomaly.anomaly_type}</TableCell>
                <TableCell>{anomaly.table_name}</TableCell>
                <TableCell>{anomaly.column_name}</TableCell>
                <TableCell>{anomaly.record_id}</TableCell>
                <TableCell>{anomaly.anomaly_value}</TableCell>
                <TableCell>{anomaly.expected_value}</TableCell>
                <TableCell>{getSeverityChip(anomaly.severity)}</TableCell>
                <TableCell>
                  {new Date(anomaly.detection_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Marquer comme résolu">
                      <IconButton
                        size="small"
                        onClick={() => updateAnomalyStatus(anomaly.id, 'RESOLVED')}
                      >
                        <CheckCircleIcon color="success" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Anomalies;