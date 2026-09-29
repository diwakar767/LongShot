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
import { getGroups, createGroup, updateGroup, deleteGroup, checkAdmin } from '../services/api';

const Groups = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupsData, setGroupsData] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [openAddGroup, setOpenAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ group_name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const fetchGroups = async () => {
    try {
      const groups = await getGroups();
      const formattedGroups = groups.map(group => ({
        id: group.group_id,
        group_name: group.group_name,
        description: group.description || '' // Handle null description
      }));
      setGroupsData(formattedGroups);
      setFilteredGroups(formattedGroups); // Initialize filtered data
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      alert(error.response?.data?.error || 'Failed to fetch groups');
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
    const filtered = groupsData.filter(group =>
      group.group_name.toLowerCase().includes(lowercasedQuery) ||
      group.description.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredGroups(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, groupsData]);

  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
  }, []);

  const handleOpenAddGroup = () => setOpenAddGroup(true);
  const handleCloseAddGroup = () => {
    setOpenAddGroup(false);
    setNewGroup({ group_name: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup({ ...newGroup, [name]: value });
  };

  const handleAddGroup = async () => {
    if (newGroup.group_name) {
      try {
        await createGroup({ group_name: newGroup.group_name, description: newGroup.description });
        fetchGroups();
        handleCloseAddGroup();
      } catch (error) {
        console.error('Failed to add group:', error);
        alert(error.response?.data?.error || 'Failed to add group');
      }
    }
  };

  const handleEditGroup = async (group) => {
    const newGroupName = prompt('New group name:', group.group_name);
    const newDescription = prompt('New description:', group.description);
    if (newGroupName || newDescription) {
      try {
        await updateGroup(group.id, { 
          group_name: newGroupName || group.group_name, 
          description: newDescription || group.description 
        });
        fetchGroups();
      } catch (error) {
        console.error('Failed to update group:', error);
        alert(error.response?.data?.error || 'Failed to update group');
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(groupId);
        fetchGroups();
      } catch (error) {
        console.error('Failed to delete group:', error);
        alert(error.response?.data?.error || 'Failed to delete group');
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);
  const paginatedGroups = filteredGroups.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Groups</Typography>
        {isAdmin && (
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddGroup}
          sx={{ textTransform: 'none', borderRadius: 3, px: 3, py: 1 }}
        >
          Add Group
        </Button> )}
      </Box>

      {/* Add Group Dialog */}
      <Dialog open={openAddGroup} onClose={handleCloseAddGroup}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Group</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, pt: 2 }}>
            <TextField
              fullWidth
              label="Group Name"
              name="group_name"
              value={newGroup.group_name}
              onChange={handleInputChange}
              size="small"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newGroup.description}
              onChange={handleInputChange}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddGroup} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddGroup} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Groups Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* <TableCell sx={{ fontWeight: 600 }}>ID</TableCell> */}
                <TableCell sx={{ fontWeight: 600 }}>Group Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No groups found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGroups.map((group) => (
                  <TableRow key={group.id} hover>
                    {/* <TableCell>{group.id}</TableCell> */}
                    <TableCell sx={{ fontWeight: 500 }}>{group.group_name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditGroup(group)}
                          sx={{ textTransform: 'none', borderRadius: 3, px: 2 }}
                        >
                          Edit
                        </Button> )}
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteGroup(group.id)}
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

      {/* Pagination */}
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

export default Groups;