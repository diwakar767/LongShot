import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Button, TextField, InputAdornment, Pagination, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getApplications, createApplication, updateApplication, deleteApplication, checkAdmin } from '../services/api';

const Applications = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [applicationsData, setApplicationsData] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [openAddApplication, setOpenAddApplication] = useState(false);
  const [newApplication, setNewApplication] = useState({
    app_name: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      const apps = await getApplications();
      setApplicationsData(apps);
      setFilteredApplications(apps); // Initialize filtered data
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      alert(error.response?.data?.error || 'Failed to fetch applications');
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
    const filtered = applicationsData.filter(app =>
      app.name.toLowerCase().includes(lowercasedQuery) ||
      (app.description && app.description.toLowerCase().includes(lowercasedQuery))
    );
    setFilteredApplications(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, applicationsData]);

  useEffect(() => {
    checkAdminStatus();
    fetchApplications();
  }, []);

  const handleOpenAddApplication = () => setOpenAddApplication(true);
  const handleCloseAddApplication = () => {
    setOpenAddApplication(false);
    setNewApplication({ app_name: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApplication({ ...newApplication, [name]: value });
  };

  const handleAddApplication = async () => {
    if (newApplication.app_name) {
      try {
        await createApplication(newApplication);
        fetchApplications();
        handleCloseAddApplication();
      } catch (error) {
        console.error('Failed to add application:', error);
        alert(error.response?.data?.error || 'Failed to add application');
      }
    }
  };

  const handleEditApplication = async (app) => {
    const newName = prompt('New application name:', app.name);
    const newDescription = prompt('New description:', app.description);
    if (newName || newDescription) {
      try {
        await updateApplication(app.id, {
          app_name: newName || app.name,
          description: newDescription || app.description
        });
        fetchApplications();
      } catch (error) {
        console.error('Failed to update application:', error);
        alert(error.response?.data?.error || 'Failed to update application');
      }
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(appId);
        fetchApplications();
      } catch (error) {
        console.error('Failed to delete application:', error);
        alert(error.response?.data?.error || 'Failed to delete application');
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / rowsPerPage);
  const paginatedApplications = filteredApplications.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Applications</Typography>
        {isAdmin && (
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddApplication}
          sx={{ textTransform: 'none', borderRadius: 3, px: 3, py: 1 }}
        >
          Add Application
        </Button> )}
      </Box>

      {/* Add Application Dialog */}
      <Dialog open={openAddApplication} onClose={handleCloseAddApplication}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Application</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, pt: 2 }}>
            <TextField
              fullWidth
              label="Application Name"
              name="app_name"
              value={newApplication.app_name}
              onChange={handleInputChange}
              size="small"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newApplication.description}
              onChange={handleInputChange}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddApplication} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddApplication} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Applications Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* <TableCell sx={{ fontWeight: 600 }}>ID</TableCell> */}
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplications.map((app) => (
                  <TableRow key={app.id} hover>
                    {/* <TableCell>{app.id}</TableCell> */}
                    <TableCell sx={{ fontWeight: 500 }}>{app.name}</TableCell>
                    <TableCell>{app.description}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditApplication(app)}
                          sx={{ textTransform: 'none', borderRadius: 3, px: 2 }}
                        >
                          Edit
                        </Button> )}
                        {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteApplication(app.id)}
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

export default Applications;