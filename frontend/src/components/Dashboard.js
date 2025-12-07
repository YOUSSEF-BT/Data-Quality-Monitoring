// Dashboard.js (version avec ExportButton)
import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Button,
  Stack,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import ExportButton from './ExportButton';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', severity: 'info' });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/quality-summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Erreur de chargement:', error);
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = (message, severity) => {
    setNotification({ show: true, message, severity });
    setTimeout(() => {
      setNotification({ show: false, message: '', severity: 'info' });
    }, 5000);
  };

  const runQualityChecks = async () => {
    setRunningChecks(true);
    try {
      const response = await fetch('/api/run-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Contrôles exécutés avec succès', 'success');
        fetchDashboardData();
      } else {
        showNotification('Erreur lors de l\'exécution des contrôles', 'error');
      }
    } catch (error) {
      showNotification('Erreur de connexion au serveur', 'error');
    } finally {
      setRunningChecks(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Données pour le graphique à barres
  const checkDistribution = summary ? [
    { name: 'Validés', value: summary.passed_checks || 0, color: '#00C49F' },
    { name: 'Échecs', value: summary.failed_checks || 0, color: '#FF8042' },
    { name: 'Avertissements', value: summary.warning_checks || 0, color: '#FFBB28' }
  ] : [];

  const anomalySeverityData = [
    { name: 'Critique', value: 2, color: '#FF4D4D' },
    { name: 'Élevée', value: 3, color: '#FF8042' },
    { name: 'Moyenne', value: 2, color: '#FFBB28' },
    { name: 'Faible', value: 1, color: '#00C49F' }
  ];

  const statCards = [
    {
      title: 'Taux de Réussite',
      value: summary?.success_rate ? `${summary.success_rate.toFixed(1)}%` : '0%',
      icon: <TrendingUpIcon />,
      color: '#00C49F',
      progress: summary?.success_rate || 0,
      description: 'Qualité globale des données'
    },
    {
      title: 'Contrôles Validés',
      value: summary?.passed_checks || 0,
      icon: <CheckCircleIcon />,
      color: '#2196f3',
      progress: summary?.total_checks ? (summary.passed_checks / summary.total_checks) * 100 : 0,
      description: 'Contrôles réussis'
    },
    {
      title: 'Anomalies Actives',
      value: summary?.total_anomalies || 0,
      icon: <WarningIcon />,
      color: '#FF8042',
      progress: 100,
      description: 'Requièrent attention'
    },
    {
      title: 'Contrôles en Échec',
      value: summary?.failed_checks || 0,
      icon: <ErrorIcon />,
      color: '#FF4D4D',
      progress: summary?.total_checks ? (summary.failed_checks / summary.total_checks) * 100 : 0,
      description: 'À investiguer'
    }
  ];

  const statusData = summary ? [
    { name: 'Validé', value: summary.passed_checks || 0 },
    { name: 'Échec', value: summary.failed_checks || 0 },
    { name: 'Avertissement', value: summary.warning_checks || 0 }
  ] : [];

  const COLORS = ['#00C49F', '#FF4D4D', '#FFBB28'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Chargement du tableau de bord...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header avec actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        backgroundColor: '#f8f9fa',
        p: 3,
        borderRadius: 2,
        borderLeft: '4px solid #2196f3'
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#2c3e50' }}>
            Tableau de Bord - Qualité des Données
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Surveillance en temps réel de l'intégrité des données
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={runQualityChecks}
            disabled={runningChecks}
            sx={{
              backgroundColor: '#2196f3',
              '&:hover': { backgroundColor: '#1976d2' },
              minWidth: 220,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}
          >
            {runningChecks ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Exécution en cours...
              </>
            ) : (
              'Exécuter les Contrôles'
            )}
          </Button>
          
          <ExportButton 
            data={{ summary }} 
            filename="rapport_qualite_donnees"
          />
        </Stack>
      </Box>

      {notification.show && (
        <Alert severity={notification.severity} sx={{ mb: 3 }}>
          {notification.message}
        </Alert>
      )}

      {/* Cards statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="medium">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: card.color, fontWeight: 'bold', mt: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: `${card.color}15`,
                    borderRadius: '50%',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={card.progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: card.color,
                      borderRadius: 3
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              height: 400,
              borderRadius: 2,
              borderTop: '4px solid #2196f3',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <InsightsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="medium">
                Répartition des Contrôles
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height="80%">
              {checkDistribution.some(d => d.value > 0) ? (
                <BarChart data={checkDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Legend />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {checkDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">Aucune donnée disponible</Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              height: 400,
              borderRadius: 2,
              borderTop: '4px solid #FF8042',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="medium">
                Sévérité des Anomalies
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height="80%">
              {anomalySeverityData.some(d => d.value > 0) ? (
                <PieChart>
                  <Pie 
                    data={anomalySeverityData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    fill="#8884d8" 
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {anomalySeverityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">Aucune donnée disponible</Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Section insights */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          backgroundColor: '#f0f7ff',
          border: '1px solid #e3f2fd',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssessmentIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="medium">
            Insights et Recommandations
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                🎯 Priorité 1
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {summary?.total_anomalies > 0 
                  ? `Traiter les ${summary.total_anomalies} anomalies critiques`
                  : 'Aucune anomalie critique détectée'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                📈 Amélioration Continue
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {summary?.success_rate < 80 
                  ? `Améliorer le taux de réussite (actuel: ${summary.success_rate.toFixed(1)}%)`
                  : 'Taux de réussite satisfaisant'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                ⚡ Actions Rapides
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Exécuter les contrôles quotidiens pour maintenir la qualité
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;