// src/theme.js
import { createTheme } from '@mui/material/styles';

const lightPalette = {
  primary: {
    main: '#4f46e5', // Vibrant indigo
    light: '#e8e7ff',
  },
  secondary: {
    main: '#9333ea', // Rich purple
  },
  critical: {
    main: '#ef4444', // Bright red
    light: 'rgba(239, 68, 68, 0.1)',
  },
  high: {
    main: '#f97316', // Warm orange
    light: 'rgba(249, 115, 22, 0.1)',
  },
  medium: {
    main: '#06b6d4', // Cool cyan
    light: 'rgba(6, 182, 212, 0.1)',
  },
  low: {
    main: '#16a34a', // Positive green
    light: 'rgba(22, 163, 74, 0.1)',
  },
  background: {
    default: '#f8fafc', // Clean slate
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a', // Deep slate
    secondary: '#6b7280', // Warm gray
  },
};

const darkPalette = {
  primary: {
    main: '#6366f1', // Lively blue
    light: '#2f3349', // Darker for contrast
  },
  secondary: {
    main: '#a855f7', // Bright purple
  },
  critical: {
    main: '#f87171', // Softer red
    light: 'rgba(248, 113, 113, 0.2)',
  },
  high: {
    main: '#fb923c', // Warm orange
    light: 'rgba(251, 146, 60, 0.2)',
  },
  medium: {
    main: '#22d3ee', // Cool cyan
    light: 'rgba(34, 211, 238, 0.2)',
  },
  low: {
    main: '#4ade80', // Bright green
    light: 'rgba(74, 222, 128, 0.2)',
  },
  background: {
    default: '#0f172a', // Deep slate
    paper: '#1e293b', // Soft gray
  },
  text: {
    primary: '#f1f5f9', // Bright white
    secondary: '#9ca3af', // Muted gray
  },
};

export const alertonTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      h1: {
        fontSize: '28px',
        fontWeight: 700,
      },
      h2: {
        fontSize: '18px',
        fontWeight: 600,
      },
      h4: {
        fontSize: '24px',
        fontWeight: 600,
      },
      body1: {
        fontSize: '14px',
      },
      body2: {
        fontSize: '12px',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.08)' : '0 8px 24px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            textTransform: 'capitalize',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': {
              backgroundColor: mode === 'light' ? 'rgba(79, 70, 229, 0.04)' : 'rgba(99, 102, 241, 0.1)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: 'none',
            padding: '12px 16px',
          },
          head: {
            backgroundColor: mode === 'light' ? '#f1f5f9' : '#334155',
            color: mode === 'light' ? '#6b7280' : '#9ca3af',
            fontWeight: 500,
          },
        },
      },
    },
  });