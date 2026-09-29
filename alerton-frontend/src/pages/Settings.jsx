import React, { useState } from 'react';
import { 
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
//   Divider,
  Button
} from '@mui/material';

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    critical: true,
    major: true,
    minor: false,
    trivial: false
  });

  const handleNotificationChange = (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [event.target.name]: event.target.checked
    });
  };

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Notification Settings
      </Typography>

      {/* Push Notifications Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Push Notifications
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.critical}
                onChange={handleNotificationChange}
                name="critical"
                color="error"
              />
            }
            label="Critical"
            sx={{ 
              '& .MuiFormControlLabel-label': {
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.major}
                onChange={handleNotificationChange}
                name="major"
                color="warning"
              />
            }
            label="Major"
            sx={{ 
              '& .MuiFormControlLabel-label': {
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.minor}
                onChange={handleNotificationChange}
                name="minor"
                color="info"
              />
            }
            label="Minor"
            sx={{ 
              '& .MuiFormControlLabel-label': {
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.trivial}
                onChange={handleNotificationChange}
                name="trivial"
                color="success"
              />
            }
            label="Trivial"
            sx={{ 
              '& .MuiFormControlLabel-label': {
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          />
        </Box>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            textTransform: 'none',
            borderRadius: 3,
            px: 4,
            py: 1.5
          }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;