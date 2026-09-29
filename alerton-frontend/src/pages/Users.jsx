import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, 
  Typography, Button, TextField, InputAdornment, Pagination, Chip, Switch, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel,
  Select, MenuItem, FormControl 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getUsers, createUser, updateUser, deleteUser, checkAdmin } from '../services/api';

const Users = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    is_admin: false,
    tempPassword: true,
    password: ''
  });
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const users = await getUsers();
      // Map backend data to frontend structure
      const formattedUsers = users.map(user => ({
        id: user.user_id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        tempPassword: false, // Backend doesn't track this; assume false for now
        locked: false,      // Backend doesn't track this; placeholder
        groups: []          // We'll integrate groups later with GET /permissions/:user_id
      }));
      setUsersData(formattedUsers);
      setFilteredUsers(formattedUsers); // Initialize filtered data
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert(error.response?.data?.error || 'Failed to fetch users');
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
    const filtered = usersData.filter(user =>
      user.username.toLowerCase().includes(lowercasedQuery) ||
      user.email.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredUsers(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, usersData]);

  // Load users on mount
  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const handleOpenAddUser = () => {
    setOpenAddUser(true);
    if (newUser.tempPassword) {
      generatePassword(); // Generate password on dialog open if tempPassword is true
    }
  };

  const handleCloseAddUser = () => {
    setOpenAddUser(false);
    setNewUser({ username: '', email: '', is_admin: false, tempPassword: true, password: '' });
  };

  const handleOpenEditUser = (user) => {
    setEditUser({ id: user.id, username: user.username, email: user.email, is_admin: user.is_admin });
    setOpenEditUser(true);
  };

  const handleCloseEditUser = () => {
    setOpenEditUser(false);
    setEditUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handleToggleChange = (e) => {
    const checked = e.target.checked;
    setNewUser({ ...newUser, tempPassword: checked, password: checked ? newUser.password || generatePassword() : '' });
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email) {
      alert('Username and email are required');
      return;
    }
    if (!newUser.tempPassword && !newUser.password) {
      alert('Please enter a password or enable temporary password');
      return;
    }
    try {
      await createUser({
        username: newUser.username,
        password: newUser.tempPassword && !newUser.password ? generatePassword() : newUser.password,
        email: newUser.email,
        is_admin: newUser.is_admin
      });
      fetchUsers(); // Refresh list
      handleCloseAddUser();
    } catch (error) {
      console.error('Failed to add user:', error);
      alert(error.response?.data?.error || 'Failed to add user');
    }
  };

  const handleEditUser = async () => {
    if (editUser.username && editUser.email) {
      try {
        await updateUser(editUser.id, {
          username: editUser.username,
          email: editUser.email,
          is_admin: editUser.is_admin
        });
        fetchUsers();
        handleCloseEditUser();
      } catch (error) {
        console.error('Failed to update user:', error);
        alert(error.response?.data?.error || 'Failed to update user');
      }
    } else {
      alert('Username and email are required');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newUser.password);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Users</Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddUser}
            sx={{ textTransform: 'none', borderRadius: 3, px: 3, py: 1 }}
          >
            Add User
          </Button>
        )}
      </Box>

      {/* Add User Dialog */}
      <Dialog open={openAddUser} onClose={handleCloseAddUser}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 400, pt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              size="small"
              required
            />
            <FormControl fullWidth size="small">
              <Select
                name="is_admin"
                value={newUser.is_admin}
                onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.value })}
              >
                <MenuItem value={false}>Regular</MenuItem>
                <MenuItem value={true}>Admin</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Note: Admin users cannot be deleted, but their admin privileges can be revoked.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={newUser.tempPassword}
                  onChange={handleToggleChange}
                  name="tempPassword"
                  color="primary"
                />
              }
              label="Generate Temp Password"
              sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500, fontSize: '1rem' } }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                readOnly: newUser.tempPassword,
                endAdornment: newUser.tempPassword && (
                  <InputAdornment position="end">
                    <IconButton onClick={copyToClipboard}><ContentCopyIcon fontSize="small" /></IconButton>
                    <IconButton onClick={generatePassword}><RefreshIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddUser} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddUser} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditUser} onClose={handleCloseEditUser}>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 400, pt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={editUser?.username || ''}
              onChange={handleEditInputChange}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={editUser?.email || ''}
              onChange={handleEditInputChange}
              size="small"
              required
            />
            <FormControl fullWidth size="small">
              <Select
                name="is_admin"
                value={editUser?.is_admin || false}
                onChange={(e) => setEditUser({ ...editUser, is_admin: e.target.value })}
              >
                <MenuItem value={false}>Regular</MenuItem>
                <MenuItem value={true}>Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditUser} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditUser} sx={{ textTransform: 'none', borderRadius: 3, px: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Users Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* <TableCell sx={{ fontWeight: 600 }}>ID</TableCell> */}
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Temp Password</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Locked</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Groups</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    {/* <TableCell>{user.id}</TableCell> */}
                    <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_admin ? 'Yes' : 'No'} 
                        size="small"
                        sx={{
                          backgroundColor: user.is_admin ? 'primary.light' : 'default',
                          color: user.is_admin ? 'primary.dark' : 'text.secondary',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.tempPassword ? 'Yes' : 'No'} 
                        size="small"
                        sx={{
                          backgroundColor: user.tempPassword ? 'warning.light' : 'success.light',
                          color: user.tempPassword ? 'warning.dark' : 'success.dark',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.locked ? <LockIcon color="error" /> : <LockOpenIcon color="success" />}
                        <Typography sx={{ ml: 1 }}>{user.locked ? 'Yes' : 'No'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.groups.map((group, index) => (
                          <Chip 
                            key={index}
                            label={group} 
                            size="small"
                            sx={{ backgroundColor: 'primary.light', color: 'primary.main', fontWeight: 500 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditUser(user)}
                            sx={{ border: '1px solid', borderColor: 'primary.main', color: 'primary.main', borderRadius: 3, p: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ border: '1px solid', borderColor: 'error.main', color: 'error.main', borderRadius: 3, p: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
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

export default Users;