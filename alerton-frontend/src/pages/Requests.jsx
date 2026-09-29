import React from 'react';
import { 
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const Requests = () => {
  const requestsData = [
    { id: 1, username: 'vuen_ao', server: '10.53.25.111', country: 'UG', app: 'USSD' },
    { id: 2, username: 'wrej_ao', server: '172.27.2.4', country: 'NG', app: 'MoMo' },
    { id: 3, username: 'grok_ao', server: '10.53.25.87', country: 'UG', app: 'Rewards' },
    { id: 4, username: 'kill_ao', server: '10.230.32.151', country: 'GH', app: 'MyMTN' },
    { id: 5, username: 'modl_au', server: '172.27.8.12', country: 'RW', app: 'Blue Marble' },
    { id: 6, username: 'poet_ao', server: '172.27.2.5', country: 'NG', app: 'MoMo' },
    { id: 7, username: 'trump_ao', server: '10.53.25.87', country: 'UG', app: 'Rewards' },
  ];

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Requests
      </Typography>
      
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search requests..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Requests Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* <TableCell sx={{ fontWeight: 600 }}>S.No.</TableCell> */}
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Server</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>App</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requestsData.map((request) => (
                <TableRow key={request.id} hover>
                  {/* <TableCell>{request.id}</TableCell> */}
                  <TableCell sx={{ fontWeight: 500 }}>{request.username}</TableCell>
                  <TableCell>{request.server}</TableCell>
                  <TableCell>{request.country}</TableCell>
                  <TableCell>{request.app}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 3,
                          px: 2,
                          backgroundColor: 'success.main',
                          '&:hover': {
                            backgroundColor: 'success.dark',
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CancelIcon />}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 3,
                          px: 2,
                          color: 'error.main',
                          borderColor: 'error.main',
                          '&:hover': {
                            borderColor: 'error.main',
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={5} shape="rounded" />
      </Box>
    </Box>
  );
};

export default Requests;