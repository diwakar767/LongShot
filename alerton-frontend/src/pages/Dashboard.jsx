// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { getDashboardSummary, getAlerts, getServers, getUsers } from '../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState({ alerts: 0, servers: 0, users: 0 });

  const fetchSummary = async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      // Fallback to fetching full data
      const [alerts, servers, users] = await Promise.all([getAlerts(), getServers(), getUsers()]);
      setSummary({
        alerts: alerts.length,
        servers: servers.filter(s => s.is_active).length,
        users: users.filter(u => u.is_active).length
      });
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <Box>
      <Typography variant="h1" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" color="text.secondary">Active Alerts</Typography>
              <Typography variant="h2">{summary.alerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" color="text.secondary">Active Servers</Typography>
              <Typography variant="h2">{summary.servers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" color="text.secondary">Active Users</Typography>
              <Typography variant="h2">{summary.users}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;