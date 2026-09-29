import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Skeleton } from '@mui/material';
import { getDashboardSummary, getAlerts, getServers, getUsers } from '../services/api';
import { useFeedback } from '../context/FeedbackContext';

const Dashboard = () => {
  const { notifyError } = useFeedback();
  const [summary, setSummary] = useState({ alerts: 0, servers: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDashboardSummary();
        if (!cancelled) setSummary(data);
      } catch (error) {
        try {
          const [alerts, servers, users] = await Promise.all([
            getAlerts(),
            getServers(),
            getUsers()
          ]);
          if (!cancelled) {
            setSummary({
              alerts: alerts.length,
              servers: servers.filter((s) => s.is_active).length,
              users: users.filter((u) => u.is_active).length
            });
          }
        } catch (err) {
          notifyError('Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [notifyError]);

  const tiles = [
    { label: 'Active alerts', value: summary.alerts },
    { label: 'Active servers', value: summary.servers },
    { label: 'Active users', value: summary.users }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid item xs={12} sm={4} key={tile.label}>
            <Card
              sx={{
                borderRadius: 2,
                animation: 'listEnter 320ms ease-out',
                '@keyframes listEnter': {
                  from: { opacity: 0, transform: 'translateY(8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {tile.label}
                </Typography>
                {loading ? (
                  <Skeleton width={64} height={40} />
                ) : (
                  <Typography variant="h4" sx={{ mt: 0.5 }}>
                    {tile.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
