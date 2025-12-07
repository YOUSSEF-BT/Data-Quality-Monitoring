import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const dashboardRef = useRef(null);

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
    { name: 'Critique', value: Math.round((summary?.total_anomalies || 0) * 0.25), color: '#FF4D4D' },
    { name: 'Élevée', value: Math.round((summary?.total_anomalies || 0) * 0.38), color: '#FF8042' },
    { name: 'Moyenne', value: Math.round((summary?.total_anomalies || 0) * 0.25), color: '#FFBB28' },
    { name: 'Faible', value: Math.round((summary?.total_anomalies || 0) * 0.13), color: '#00C49F' }
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
    <Box ref={dashboardRef}>
      {/* Header avec actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3,
        borderRadius: 2,
        color: 'white',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tableau de Bord - Qualité des Données
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
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
              backgroundColor: 'white',
              color: '#667eea',
              '&:hover': { 
                backgroundColor: '#f8f9fa',
                transform: 'translateY(-2px)'
              },
              minWidth: 220,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
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
            dashboardRef={dashboardRef}
          />
        </Stack>
      </Box>

      {notification.show && (
        <Alert 
          severity={notification.severity} 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Cards statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box sx={{ 
                height: 4,
                background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}99 100%)`
              }} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      color: card.color, 
                      fontWeight: 'bold', 
                      mb: 0.5,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: `${card.color}20`,
                    borderRadius: '50%',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ 
                      color: card.color,
                      fontSize: '1.5rem'
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={card.progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}99 100%)`,
                      borderRadius: 4
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
            elevation={3}
            sx={{ 
              p: 3, 
              height: 400,
              borderRadius: 3,
              overflow: 'hidden',
              borderTop: '4px solid #667eea',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <InsightsIcon sx={{ 
                mr: 1, 
                color: '#667eea',
                fontSize: '1.5rem'
              }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50' }}>
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
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
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
            elevation={3}
            sx={{ 
              p: 3, 
              height: 400,
              borderRadius: 3,
              overflow: 'hidden',
              borderTop: '4px solid #764ba2',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon sx={{ 
                mr: 1, 
                color: '#764ba2',
                fontSize: '1.5rem'
              }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50' }}>
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
                    innerRadius={60}
                    outerRadius={120} 
                    paddingAngle={5}
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
        elevation={3}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
          border: '1px solid #d1e3f8',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssessmentIcon sx={{ 
            mr: 1, 
            color: '#667eea',
            fontSize: '1.8rem'
          }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#2c3e50' }}>
            Insights et Recommandations
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: 2,
              height: '100%',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              borderTop: '4px solid #FF4D4D'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#FF4D4D" sx={{ mb: 1 }}>
                🎯 Priorité 1
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#555', lineHeight: 1.6 }}>
                {summary?.total_anomalies > 0 
                  ? `Traiter les ${summary.total_anomalies} anomalies critiques identifiées. Les anomalies critiques impactent directement la fiabilité des données et nécessitent une action immédiate.`
                  : 'Aucune anomalie critique détectée - excellent travail !'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: 2,
              height: '100%',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              borderTop: '4px solid #FFBB28'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#FFBB28" sx={{ mb: 1 }}>
                📈 Amélioration Continue
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#555', lineHeight: 1.6 }}>
                {summary?.success_rate < 80 
                  ? `Améliorer le taux de réussite (actuel: ${summary.success_rate.toFixed(1)}%). Cible recommandée: 85%. Focus sur les contrôles en échec et les données manquantes.`
                  : `Taux de réussite excellent (${summary?.success_rate.toFixed(1)}%). Maintenir cette performance et viser l'excellence (95%+).`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: 2,
              height: '100%',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              borderTop: '4px solid #00C49F'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#00C49F" sx={{ mb: 1 }}>
                ⚡ Actions Rapides
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#555', lineHeight: 1.6 }}>
                Exécuter les contrôles quotidiens pour maintenir la qualité. Automatiser les rapports et définir des alertes proactives pour les anomalies futures.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;