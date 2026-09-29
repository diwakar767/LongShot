// src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Notifications as AlertsIcon,
  Dns as ServersIcon,
  Description as RequestsIcon,
  Groups as GroupsIcon,
  People as UsersIcon,
  History as AuditIcon,
  Settings as SettingsIcon,
  Apps as AppsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const theme = useTheme();
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Alerts', icon: <AlertsIcon />, path: '/alerts' },
    { text: 'Servers', icon: <ServersIcon />, path: '/servers' },
    { text: 'Requests', icon: <RequestsIcon />, path: '/requests' },
    { text: 'Groups', icon: <GroupsIcon />, path: '/groups' },
    { text: 'Users', icon: <UsersIcon />, path: '/users' },
    { text: 'Audit', icon: <AuditIcon />, path: '/audit' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Applications', icon: <AppsIcon />, path: '/applications' },
  ];

  const drawerWidth = isExpanded ? 240 : 64;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 8px 24px rgba(0, 0, 0, 0.08)'
              : '0 8px 24px rgba(0, 0, 0, 0.2)',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
    >
      <Box
        sx={{
          p: isExpanded ? 3 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
        }}
      >
        <Box
          component="img"
          src="/AlertOn_logo.png" // Make sure it's placed in the public folder
          alt="AlertOn Logo"
          sx={{
            width: isExpanded ? 32 : 24,
            height: isExpanded ? 32 : 24,
            // bgcolor: 'primary.main',
            borderRadius: theme.shape.borderRadius / 3,
            mr: isExpanded ? 2 : 0,
            transition: theme.transitions.create(['width', 'height'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            objectFit: 'contain', // Keeps the aspect ratio
            p: 0.5, // Optional: adds a little padding inside the circle
          }}
        />

        {isExpanded && (
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            AlertOn
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: isExpanded ? 'flex-end' : 'center', px: isExpanded ? 2 : 0 }}>
        <Tooltip title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <List sx={{ px: isExpanded ? 2 : 1 }}>
        {navItems.map((item) => (
          <Tooltip key={item.text} title={isExpanded ? '' : item.text} placement="right">
            <ListItem
              button
              component={Link}
              to={item.path}
              sx={{
                borderRadius: theme.shape.borderRadius / 3,
                mb: 0.5,
                py: 0.5, // Reduced padding for tighter spacing
                bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
                color: location.pathname === item.path ? 'primary.main' : theme.palette.text.primary,
                '&:hover': {
                  bgcolor: location.pathname === item.path ? 'primary.light' : theme.palette.action.hover,
                },
                transition: theme.transitions.create(['background-color', 'color'], {
                  duration: theme.transitions.duration.short,
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : theme.palette.text.secondary,
                  minWidth: isExpanded ? '40px' : 'auto',
                  justifyContent: 'center', // Centered icons in both states
                }}
              >
                {item.icon}
              </ListItemIcon>
              {isExpanded && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;