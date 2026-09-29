import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, TextField, InputAdornment, Pagination, Switch, FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getAuditLogs } from '../services/api';

const Audit = () => {
  const [auditData, setAuditData] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showMiddlewareLogs, setShowMiddlewareLogs] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const logs = await getAuditLogs();
      setAuditData(logs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      alert(error.response?.data?.error || 'Failed to fetch audit logs');
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = auditData
    .filter(log =>
      (showMiddlewareLogs || !log.action.includes(' ')) && // Exclude middleware logs (e.g., "DELETE /users/9") if toggled off
      (
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        new Date(log.timestamp).toLocaleString().toLowerCase().includes(search.toLowerCase())
      )
    );

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = filteredLogs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Audit Log
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search audit logs..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: '100%', sm: 500 } }}
          aria-label="Search audit logs"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showMiddlewareLogs}
              onChange={(e) => setShowMiddlewareLogs(e.target.checked)}
            />
          }
          label="Show middleware logs (e.g., DELETE /users/9)"
        />
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label="Audit log table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          shape="rounded"
          aria-label="Audit log pagination"
        />
      </Box>
    </Box>
  );
};

export default Audit;