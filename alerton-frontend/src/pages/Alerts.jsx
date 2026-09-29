import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, TextField, InputAdornment, Pagination, MenuItem, FormControl,
  Select, Grid, Button, Checkbox, ListItemText, InputLabel, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { getAlerts, createAlert, checkAdmin } from '../services/api';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 }
  }
};

const Alerts = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    countries: [], apps: [], severities: [], groups: [], servers: [], search: ''
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAddAlert, setOpenAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    message: '', severity: 'minor', country: '', server: '', app: '', group: ''
  });
  const [openViewDialog, setOpenViewDialog] = useState(false); // State for view dialog
  const [selectedMessage, setSelectedMessage] = useState(''); // State for full message

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      const formattedData = data.map(alert => ({
        ...alert,
        severity: alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)
      }));
      setAlerts(formattedData);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setError(error.response?.data?.error || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };
 
  const checkAdminStatus = async () => {
    try {
      const response = await checkAdmin();
      console.log('Check admin response:', response);
      setIsAdmin(true); // If successful, user is admin
    } catch (error) {
      console.error('Failed to check admin status:', error.response?.status, error.response?.data);
      setIsAdmin(false); // 403 or other errors mean not admin
    }
  };

  useEffect(() => {
  checkAdminStatus();
  fetchAlerts();
  }, []);

  // Filter options
  const allCountries = [...new Set(alerts.map(alert => alert.country))].filter(Boolean);
  const allApps = [...new Set(alerts.map(alert => alert.app))].filter(Boolean);
  const allSeverities = ['Critical', 'Major', 'Minor', 'Trivial'];
  const allGroups = [...new Set(alerts.map(alert => alert.group))].filter(Boolean);
  const allServers = [...new Set(alerts.map(alert => alert.server))].filter(Boolean);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const countryMatch = filters.countries.length === 0 || filters.countries.includes(alert.country);
    const appMatch = filters.apps.length === 0 || filters.apps.includes(alert.app);
    const severityMatch = filters.severities.length === 0 || filters.severities.includes(alert.severity);
    const groupMatch = filters.groups.length === 0 || filters.groups.includes(alert.group);
    const serverMatch = filters.servers.length === 0 || filters.servers.includes(alert.server);
    const searchMatch =
      alert.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.country.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.app.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.group.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.server.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.serverIp.toLowerCase().includes(filters.search.toLowerCase());
    return countryMatch && appMatch && severityMatch && groupMatch && serverMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / rowsPerPage);
  const paginatedAlerts = filteredAlerts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ countries: [], apps: [], severities: [], groups: [], servers: [], search: '' });
    setPage(1);
  };

  const handleAddAlertOpen = () => setOpenAddAlert(true);
  const handleAddAlertClose = () => {
    setOpenAddAlert(false);
    setNewAlert({ message: '', severity: 'minor', country: '', server: '', app: '', group: '' });
  };

  const handleAlertChange = (e) => {
    const { name, value } = e.target;
    setNewAlert(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAlert = async () => {
    if (!newAlert.message) {
      setError('Message is required');
      return;
    }
    try {
      await createAlert({
        message: newAlert.message,
        severity: newAlert.severity.toLowerCase(),
        country_name: newAlert.country,
        server_name: newAlert.server,
        app_name: newAlert.app,
        group_name: newAlert.group
      });
      await fetchAlerts();
      handleAddAlertClose();
    } catch (error) {
      console.error('Failed to create alert:', error);
      setError(error.response?.data?.error || 'Failed to create alert');
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedMessage('');
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  const severityColors = {
    Critical: 'error',
    Major: 'warning',
    Minor: 'info',
    Trivial: 'success'
  };

  // Trim message to 15 characters and append ...
  const trimMessage = (message) => {
    return message.length > 15 ? `${message.slice(0, 15)}...` : message;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Alerts</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAlertOpen}
            sx={{ textTransform: 'none', borderRadius: 3, px: 3, py: 1 }}
          >
            Add Alert
          </Button>
        )}
      </Box>

      {/* Add Alert Dialog */}
      <Dialog open={openAddAlert} onClose={handleAddAlertClose}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Alert</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, pt: 2 }}>
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={newAlert.message}
              onChange={handleAlertChange}
              size="small"
              required
              error={!!error && !newAlert.message}
              helperText={error && !newAlert.message ? 'Message is required' : ''}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={newAlert.severity}
                name="severity"
                onChange={handleAlertChange}
                label="Severity"
              >
                {allSeverities.map(severity => (
                  <MenuItem key={severity} value={severity.toLowerCase()}>
                    {severity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={newAlert.country}
              onChange={handleAlertChange}
              size="small"
            />
            <TextField
              fullWidth
              label="Server"
              name="server"
              value={newAlert.server}
              onChange={handleAlertChange}
              size="small"
            />
            <TextField
              fullWidth
              label="App"
              name="app"
              value={newAlert.app}
              onChange={handleAlertChange}
              size="small"
            />
            <TextField
              fullWidth
              label="Group"
              name="group"
              value={newAlert.group}
              onChange={handleAlertChange}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleAddAlertClose} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddAlert} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog}>
        <DialogTitle sx={{ fontWeight: 600 }}>Alert Description</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ wordBreak: 'break-word', p: 2 }}>
            {selectedMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseViewDialog} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search alerts..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              aria-label="Search alerts"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FilterAltIcon color="action" />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  multiple
                  value={filters.countries}
                  onChange={(e) => handleFilterChange('countries', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                  label="Country"
                >
                  {allCountries.map((country) => (
                    <MenuItem key={country} value={country}>
                      <Checkbox checked={filters.countries.includes(country)} />
                      <ListItemText primary={country} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  multiple
                  value={filters.severities}
                  onChange={(e) => handleFilterChange('severities', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                  label="Severity"
                >
                  {allSeverities.map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      <Checkbox checked={filters.severities.includes(severity)} />
                      <ListItemText primary={severity} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={resetFilters} startIcon={<ClearIcon />} size="small" sx={{ textTransform: 'none' }}>
                Clear
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>App</InputLabel>
                <Select
                  multiple
                  value={filters.apps}
                  onChange={(e) => handleFilterChange('apps', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                  label="App"
                >
                  {allApps.map((app) => (
                    <MenuItem key={app} value={app}>
                      <Checkbox checked={filters.apps.includes(app)} />
                      <ListItemText primary={app} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Group</InputLabel>
                <Select
                  multiple
                  value={filters.groups}
                  onChange={(e) => handleFilterChange('groups', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                  label="Group"
                >
                  {allGroups.map((group) => (
                    <MenuItem key={group} value={group}>
                      <Checkbox checked={filters.groups.includes(group)} />
                      <ListItemText primary={group} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Server</InputLabel>
                <Select
                  multiple
                  value={filters.servers}
                  onChange={(e) => handleFilterChange('servers', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                  label="Server"
                >
                  {allServers.map((server) => (
                    <MenuItem key={server} value={server}>
                      <Checkbox checked={filters.servers.includes(server)} />
                      <ListItemText primary={server} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label="Alerts table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Server</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Server IP</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>App</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Group</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAlerts.map((alert) => (
                  <TableRow key={alert.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{trimMessage(alert.message)}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.severity}
                        color={severityColors[alert.severity]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{alert.country}</TableCell>
                    <TableCell>{alert.server}</TableCell>
                    <TableCell>{alert.serverIp}</TableCell>
                    <TableCell>{alert.app}</TableCell>
                    <TableCell>{alert.group}</TableCell>
                    <TableCell>
                      {new Date(alert.timestamp).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewMessage(alert.message)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          shape="rounded"
          aria-label="Alerts pagination"
        />
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Alerts;