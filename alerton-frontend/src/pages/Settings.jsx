import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Alert
} from '@mui/material';
import { useFeedback } from '../context/FeedbackContext';

const STORAGE_KEY = 'longshot_inapp_severity_prefs';

const defaults = {
  critical: true,
  major: true,
  minor: false,
  trivial: false
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

/** Trimmed Settings: severity prefs for upcoming in-app notifications only. */
const Settings = () => {
  const { notifySuccess } = useFeedback();
  const [prefs, setPrefs] = useState(loadPrefs);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const handleChange = (event) => {
    setPrefs((prev) => ({ ...prev, [event.target.name]: event.target.checked }));
    setDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setDirty(false);
    notifySuccess('In-app notification preferences saved on this device');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
        Choose which alert severities should create in-app notifications. Delivery wires up in the
        In-App Notifications sprint; prefs are stored locally for now.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        No email, SMS, or paid push — in-app inbox only.
      </Alert>

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="h2" gutterBottom>
          In-app notify by severity
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          {[
            { name: 'critical', label: 'Critical', color: 'error' },
            { name: 'major', label: 'Major', color: 'warning' },
            { name: 'minor', label: 'Minor', color: 'info' },
            { name: 'trivial', label: 'Trivial', color: 'success' }
          ].map((row) => (
            <FormControlLabel
              key={row.name}
              control={
                <Switch
                  checked={prefs[row.name]}
                  onChange={handleChange}
                  name={row.name}
                  color={row.color}
                />
              }
              label={row.label}
            />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={!dirty}>
          Save preferences
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
