import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatCard = ({ title, value, change }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption">
            {change}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;