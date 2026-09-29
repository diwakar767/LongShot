import React, { useState, useEffect  } from 'react';
import { 
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import { getCurrentUser } from '../services/api';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInitials, setUserInitials] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      const user = await getCurrentUser(); // Use the getCurrentUser service to fetch user info
      const username = user.username;
      if (username) {
        const firstLetter = username.charAt(0).toUpperCase(); // First letter of the username
        const lastLetter = username.charAt(username.length - 1).toUpperCase(); // Last letter of the username
        setUserInitials(firstLetter + lastLetter); // Set the initials in the state
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  // Fetch user data when the component is mounted
  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching user data
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <Box>
          <ThemeToggle />
          <IconButton onClick={handleMenu}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{userInitials ? (
            <span>{userInitials}</span> // Show initials of logged-in user
          ) : (
            <span>JD</span> // Default initials (fallback)
          )}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 180,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
          >
            <MenuItem onClick={handleLogout}>
              <Typography color="error">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;