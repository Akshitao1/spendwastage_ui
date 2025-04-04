import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress, Container, Typography } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import LoginPage from './pages/LoginPage';
import ClientSelectionPage from './pages/ClientSelectionPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AuthProvider } from './context/AuthContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Create a separate component for the authenticated content
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isConfiguring, setIsConfiguring] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing application...');
        setIsConfiguring(true);
        setIsConfiguring(false);
        console.log('Initialization complete');
      } catch (error) {
        console.error('Failed to initialize application:', error instanceof Error ? error.name : 'Unknown error');
        setIsConfiguring(false);
      }
    };

    initialize();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isConfiguring) {
    return (
      <Container>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Initializing application...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <DashboardPage />} />
        <Route path="/client-selection" element={isAuthenticated ? <ClientSelectionPage /> : <LoginPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <LoginPage />} />
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <LoginPage />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <UserPreferencesProvider>
            <AuthenticatedApp />
          </UserPreferencesProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
