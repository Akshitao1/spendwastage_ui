import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from 'react-oidc-context';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { fetchSpendWastageActions, getDefaultStartDate, getDefaultEndDate } from '../services/apiService';
import { SpendWastageAction } from '../types';
import { DatePicker } from '../components/DatePicker';
import { SpendWastageTable } from '../components/SpendWastageTable';
import { TotalJobMetricsTable } from '../components/TotalJobMetricsTable';

const DashboardPage: React.FC = () => {
  const auth = useAuth();
  const { selectedClientIds, hasInitialClientSelections, isLoading: prefsLoading } = useUserPreferences();
  const navigate = useNavigate();

  const isAuthenticated = auth.isAuthenticated;
  const authLoading = auth.isLoading;

  const [actions, setActions] = useState<SpendWastageAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<Date>(getDefaultEndDate());

  // Group actions by client
  const groupedActions = useMemo(() => {
    if (!actions || !Array.isArray(actions)) return {};
    
    return actions.reduce((acc, action) => {
      const clientName = action.client_name || 'Unknown Client';
      if (!acc[clientName]) {
        acc[clientName] = [];
      }
      acc[clientName].push(action);
      return acc;
    }, {} as Record<string, SpendWastageAction[]>);
  }, [actions]);

  // If user is not authenticated or has no client selections, redirect accordingly
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!authLoading && isAuthenticated && !hasInitialClientSelections) {
      navigate('/client-selection');
    }
  }, [authLoading, isAuthenticated, hasInitialClientSelections, navigate]);

  // Fetch spend wastage actions when component mounts or filters change
  useEffect(() => {
    const loadActions = async () => {
      if (!selectedClientIds.length) return;

      try {
        setLoading(true);
        const data = await fetchSpendWastageActions(selectedClientIds, startDate, endDate);
        setActions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load spend wastage actions.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && hasInitialClientSelections) {
      loadActions();
    }
  }, [isAuthenticated, hasInitialClientSelections, selectedClientIds, startDate, endDate]);

  // Handle filter update
  const handleDateChange = () => {
    // This will trigger the useEffect that fetches data
  };

  // Loading state
  if (authLoading || prefsLoading || loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Spend Wastage Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/client-selection')}
            startIcon={<EditIcon />}
          >
            Edit Clients
          </Button>
        </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
            Date Range
              </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
                    label="Start Date"
              value={startDate}
              onChange={(newValue: Date | null) => setStartDate(newValue || new Date())}
              sx={{ width: '200px' }}
            />
            <DatePicker
                    label="End Date"
              value={endDate}
              onChange={(newValue: Date | null) => setEndDate(newValue || new Date())}
              sx={{ width: '200px' }}
            />
                    <Button
                      variant="contained"
              onClick={handleDateChange}
              disabled={loading}
              sx={{ minWidth: '120px' }}
            >
              Apply
                    </Button>
            </Box>
          </Paper>

          <TotalJobMetricsTable actions={actions} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box>
            {Object.entries(groupedActions).map(([clientName, clientActions]) => (
              <Paper key={clientName} elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                  {clientName}
              </Typography>
                <SpendWastageTable actions={clientActions} />
              </Paper>
            ))}
            </Box>
        )}
        </Box>
      </Container>
  );
};

export default DashboardPage; 