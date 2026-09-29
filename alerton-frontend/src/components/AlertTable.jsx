import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Chip
} from '@mui/material';

const AlertTable = ({ alerts }) => {
  const severityStyles = {
    critical: { bgcolor: 'critical.light', color: 'critical.main' },
    high: { bgcolor: 'high.light', color: 'high.main' },
    medium: { bgcolor: 'medium.light', color: 'medium.main' },
    low: { bgcolor: 'low.light', color: 'low.main' },
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h2" component="h2">
          Recent Alerts
        </Typography>
        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ 
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          View All Alerts
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell sx={{ fontWeight: 500 }}>{alert.message}</TableCell>
                <TableCell>
                  <Chip 
                    label={alert.severity} 
                    sx={{ 
                      ...severityStyles[alert.severity],
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{alert.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AlertTable;