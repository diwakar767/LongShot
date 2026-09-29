import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Button, TextField, InputAdornment, Pagination, Dialog, DialogTitle, 
  DialogContent, DialogActions, MenuItem 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getServers, createServer, updateServer, deleteServer, getCountries, checkAdmin } from '../services/api';

const Servers = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [serversData, setServersData] = useState([]);
  const [filteredServers, setFilteredServers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [openAddServer, setOpenAddServer] = useState(false);
  const [newServer, setNewServer] = useState({
    server_name: '',
    ip_address: '',
    country_name: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch servers and countries
  const fetchServers = async () => {
    try {
      const servers = await getServers();
      setServersData(servers);
      setFilteredServers(servers); // Initialize filtered data
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      alert(error.response?.data?.error || 'Failed to fetch servers');
    }
  };

  const fetchCountries = async () => {
    try {
      const countryData = await getCountries();
      setCountries(countryData);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      alert(error.response?.data?.error || 'Failed to fetch countries');
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

  // Search filtering
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = serversData.filter(server =>
      server.name.toLowerCase().includes(lowercasedQuery) ||
      server.ip.toLowerCase().includes(lowercasedQuery) ||
      server.country.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredServers(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, serversData]);

  useEffect(() => {
    checkAdminStatus();
    fetchServers();
    fetchCountries();
  }, []);

  const handleOpenAddServer = () => setOpenAddServer(true);
  const handleCloseAddServer = () => {
    setOpenAddServer(false);
    setNewServer({ server_name: '', ip_address: '', country_name: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewServer({ ...newServer, [name]: value });
  };

  const handleAddServer = async () => {
    if (newServer.server_name && newServer.ip_address && newServer.country_name) {
      try {
        await createServer(newServer);
        fetchServers();
        handleCloseAddServer();
      } catch (error) {
        console.error('Failed to add server:', error);
        alert(error.response?.data?.error || 'Failed to add server');
      }
    }
  };

  const handleEditServer = async (server) => {
    const newName = prompt('New server name:', server.name);
    const newIp = prompt('New IP address:', server.ip);
    const newCountry = prompt('New country name:', server.country);
    if (newName || newIp || newCountry) {
      try {
        await updateServer(server.id, {
          server_name: newName || server.name,
          ip_address: newIp || server.ip,
          country_name: newCountry || server.country
        });
        fetchServers();
      } catch (error) {
        console.error('Failed to update server:', error);
        alert(error.response?.data?.error || 'Failed to update server');
      }
    }
  };

  const handleDeleteServer = async (serverId) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      try {
        await deleteServer(serverId);
        fetchServers();
      } catch (error) {
        console.error('Failed to delete server:', error);
        alert(error.response?.data?.error || 'Failed to delete server');
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredServers.length / rowsPerPage);
  const paginatedServers = filteredServers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Servers</Typography>
        {isAdmin && (
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddServer}
          sx={{ textTransform: 'none', borderRadius: 3, px: 3, py: 1 }}
        >
          Add Server
        </Button> ) }
      </Box>

      {/* Add Server Dialog */}
      <Dialog open={openAddServer} onClose={handleCloseAddServer}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Server</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, pt: 2 }}>
            <TextField
              fullWidth
              label="Server Name"
              name="server_name"
              value={newServer.server_name}
              onChange={handleInputChange}
              size="small"
            />
            <TextField
              fullWidth
              label="IP Address"
              name="ip_address"
              value={newServer.ip_address}
              onChange={handleInputChange}
              size="small"
            />
            <TextField
              select
              fullWidth
              label="Country"
              name="country_name"
              value={newServer.country_name}
              onChange={handleInputChange}
              size="small"
            >
              {countries.map((country) => (
                <MenuItem key={country.country_id} value={country.country_name}>
                  {country.country_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddServer} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddServer} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search servers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Servers Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* <TableCell sx={{ fontWeight: 600 }}>ID</TableCell> */}
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedServers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No servers found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServers.map((server) => (
                  <TableRow key={server.id} hover>
                    {/* <TableCell>{server.id}</TableCell> */}
                    <TableCell sx={{ fontWeight: 500 }}>{server.name}</TableCell>
                    <TableCell>{server.ip}</TableCell>
                    <TableCell>{server.country}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditServer(server)}
                          sx={{ textTransform: 'none', borderRadius: 3, px: 2 }}
                        >
                          Edit
                        </Button> )}
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteServer(server.id)}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 3,
                            px: 2,
                            color: 'error.main',
                            borderColor: 'error.main',
                            '&:hover': { borderColor: 'error.main' }
                          }}
                        >
                          Delete
                        </Button> )}
                      </Box>
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
          onChange={(e, newPage) => setPage(newPage)}
          shape="rounded"
        />
      </Box>
    </Box>
  );
};

export default Servers;