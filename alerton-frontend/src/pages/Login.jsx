import React, { useState, useEffect } from 'react';
import { login, requestOTP, verifyOTP, resetPassword } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputAdornment,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modalError, setModalError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
  
    try {
      const { token } = await login(credentials);
      localStorage.setItem('authToken', token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setModalError('Please enter your email');
      return;
    }

    try {
      await requestOTP(email);
      setForgotPasswordOpen(false);
      setOtpModalOpen(true);
      setModalError('');
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const { user_id } = await verifyOTP(email, otp);
      setModalError('');
      setOtpModalOpen(false);
      setResetPasswordOpen(true);
      setUserId(user_id);
      setOtp('');
    } catch (err) {
      setModalError(err.response?.data?.error || 'Invalid OTP');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setModalError('Password must be at least 8 characters');
      return;
    }

    try {
      await resetPassword(userId, newPassword);
      setModalError('');
      setResetPasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setEmail('');
      setError('Password reset successfully. Please log in.');
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              mb: 2
            }}
          >
            <LockIcon fontSize="large" />
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            AlertOn
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Box 
            sx={{ 
              backgroundColor: 'error.light', 
              color: 'error.main',
              p: 2,
              mb: 3,
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            {error}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Sign In
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link
            href="#"
            variant="body2"
            sx={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              setForgotPasswordOpen(true);
            }}
          >
            Forgot password?
          </Link>
        </Box>
      </Paper>

      {/* Forgot Password Email Modal */}
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your email to receive an OTP.
          </Typography>
          {modalError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {modalError}
            </Typography>
          )}
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            type="email"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword} variant="contained">Send OTP</Button>
        </DialogActions>
      </Dialog>

      {/* OTP Modal */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            An OTP has been sent to {email}.
          </Typography>
          {modalError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {modalError}
            </Typography>
          )}
          <TextField
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpModalOpen(false)}>Cancel</Button>
          <Button onClick={handleVerifyOTP} variant="contained">Verify</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {modalError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {modalError}
            </Typography>
          )}
          <TextField
            label="New Password"
            type={showResetPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    edge="end"
                  >
                    {showResetPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Confirm Password"
            type={showResetPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    edge="end"
                  >
                    {showResetPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained">Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;