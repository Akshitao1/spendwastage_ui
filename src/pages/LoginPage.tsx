import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from 'react-oidc-context';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  // Redirect to client selection or dashboard if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      // Navigate to client selection page
      navigate('/client-selection');
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  const handleLoginClick = () => {
    // Use the OIDC context to initiate sign-in
    auth.signinRedirect();
  };

  if (auth.isLoading) {
    return (
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="h5" sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (auth.error) {
    return (
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body1" gutterBottom>
            {auth.error.message}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => auth.signinRedirect()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 500,
            width: '100%',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Joveo Spend Wastage Actions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Please log in with your Joveo Google account to access the application.
            Only @joveo.com accounts are allowed.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleLoginClick}
            sx={{ mt: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 