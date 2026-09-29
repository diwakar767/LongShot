import React from 'react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import { alertonTheme } from './theme';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import TotpSetup from './pages/TotpSetup';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
// import Alerts from './pages/Alerts_new';
import Servers from './pages/Servers';
import Requests from './pages/Requests';
import Groups from './pages/Groups';
import Users from './pages/Users';
import Audit from './pages/Audit';
import Settings from './pages/Settings';
import Applications from './pages/Applications';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { ThemeProviderWrapper } from './context/ThemeContext';
import { Box } from '@mui/material';
import { isAuthenticated } from './utils/auth';

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/totp-setup" element={<TotpSetup />} />
          <Route path="*" element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <Box sx={{ flexGrow: 1 }}>
                  <Navbar />
                  <Box component="main" sx={{ p: 3 }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/servers" element={<Servers />} />
                      <Route path="/requests" element={<Requests />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/audit" element={<Audit />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/applications" element={<Applications />} />
                    </Routes>
                  </Box>
                </Box>
              </Box>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProviderWrapper>
  );
}

export default App;