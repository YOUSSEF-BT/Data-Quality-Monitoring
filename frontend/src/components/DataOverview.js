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
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';

const DataOverview = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/sales-data');
      const data = await response.json();
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRowColor = (row) => {
    if (row.quantity < 0 || row.total_amount < 0) {
      return '#ffebee';
    }
    if (!row.customer_id || !row.transaction_date) {
      return '#fff3e0';
    }
    return '';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Chargement des données...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Aperçu des Données
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualisation des données métier avec mise en évidence des anomalies
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total des Transactions
              </Typography>
              <Typography variant="h4">
                {salesData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Montant Total
              </Typography>
              <Typography variant="h4">
                {salesData.reduce((sum, row) => sum + (parseFloat(row.total_amount) || 0), 0).toFixed(2)} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Transactions Problématiques
              </Typography>
              <Typography variant="h4" color="error">
                {salesData.filter(row => row.quantity < 0 || row.total_amount < 0 || !row.customer_id || !row.transaction_date).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Transaction</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Produit</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Prix Unitaire</TableCell>
              <TableCell>Montant Total</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Région</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesData.length > 0 ? (
              salesData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ backgroundColor: getRowColor(row) }}
                >
                  <TableCell>{row.transaction_id || `TRX-${index + 1}`}</TableCell>
                  <TableCell>
                    {row.customer_id || <Chip label="Manquant" color="warning" size="small" />}
                  </TableCell>
                  <TableCell>{row.product_id || `PROD-${index + 1}`}</TableCell>
                  <TableCell>
                    {row.quantity < 0 ? (
                      <Chip label={row.quantity} color="error" size="small" />
                    ) : (
                      row.quantity || 0
                    )}
                  </TableCell>
                  <TableCell>{row.unit_price || 0}</TableCell>
                  <TableCell>
                    {row.total_amount < 0 ? (
                      <Chip label={row.total_amount} color="error" size="small" />
                    ) : (
                      row.total_amount || 0
                    )}
                  </TableCell>
                  <TableCell>
                    {row.transaction_date || <Chip label="Manquante" color="warning" size="small" />}
                  </TableCell>
                  <TableCell>{row.region || 'Non spécifié'}</TableCell>
                  <TableCell>
                    {row.quantity < 0 || row.total_amount < 0 ? (
                      <Chip label="Erreur de calcul" color="error" size="small" />
                    ) : !row.customer_id || !row.transaction_date ? (
                      <Chip label="Donnée incomplète" color="warning" size="small" />
                    ) : (
                      <Chip label="Valide" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    Aucune donnée disponible
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataOverview;
