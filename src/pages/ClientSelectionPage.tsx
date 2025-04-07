import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useAuth } from 'react-oidc-context';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { fetchClients, getUniqueAgencyIds, fetchClientsByAgency } from '../services/apiService';
import { Client } from '../types';

const ClientSelectionPage: React.FC = () => {
  const auth = useAuth();
  const { selectedClientIds, saveClientSelections, hasInitialClientSelections, isLoading: prefsLoading, error: prefsError } = useUserPreferences();
  const navigate = useNavigate();

  const isAuthenticated = auth.isAuthenticated;
  const authLoading = auth.isLoading;

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [agencyIds, setAgencyIds] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>('');

  // If user is already authenticated and has selected clients, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading && hasInitialClientSelections && window.location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, hasInitialClientSelections, navigate]);

  // Fetch clients and agency IDs on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch all clients
        const allClients = await fetchClients();
        setClients(allClients);
        setFilteredClients(allClients);

        // Fetch agency IDs
        const agencies = await getUniqueAgencyIds();
        setAgencyIds(agencies);

        // Set selected clients from user preferences
        setSelectedClients(selectedClientIds);
      } catch (err) {
        setError('Failed to load clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadData();
    }
  }, [isAuthenticated, authLoading, selectedClientIds]);

  // Handle agency filter change
  const handleAgencyChange = async (event: SelectChangeEvent) => {
    const agencyId = event.target.value;
    setSelectedAgency(agencyId);

    try {
      setLoading(true);
      if (agencyId) {
        const clientsByAgency = await fetchClientsByAgency(agencyId);
        // Only update filteredClients for available clients section
        setFilteredClients(clientsByAgency.filter(client => !selectedClients.includes(client.client_id)));
      } else {
        // Only update filteredClients for available clients section
        setFilteredClients(clients.filter(client => !selectedClients.includes(client.client_id)));
      }
    } catch (err) {
      setError('Failed to filter clients by agency.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Filter only available clients (not selected)
    let filtered = clients.filter(client => !selectedClients.includes(client.client_id));
    
    if (selectedAgency) {
      filtered = filtered.filter(client => client.agency_id === selectedAgency);
    }
    
    if (searchValue) {
      filtered = filtered.filter(
        client => 
          client.client_name.toLowerCase().includes(searchValue) ||
          client.client_id.toLowerCase().includes(searchValue) ||
          client.agency_id.toLowerCase().includes(searchValue)
      );
    }
    
    setFilteredClients(filtered);
  };

  // Handle client selection
  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // Handle select all available clients
  const handleSelectAllAvailable = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Add all available client IDs to selected clients
      const allAvailableClientIds = filteredClients.map(client => client.client_id);
      setSelectedClients(prev => Array.from(new Set([...prev, ...allAvailableClientIds])));
    } else {
      // Remove all available client IDs from selected clients
      const availableClientIds = new Set(filteredClients.map(client => client.client_id));
      setSelectedClients(prev => prev.filter(id => !availableClientIds.has(id)));
    }
  };

  // Check if all available clients are selected
  const areAllAvailableSelected = filteredClients.length > 0 && 
    filteredClients.every(client => selectedClients.includes(client.client_id));

  // Save selected clients and navigate to dashboard
  const handleSaveSelections = async () => {
    if (selectedClients.length === 0) {
      setError('Please select at least one client.');
      return;
    }

    try {
      await saveClientSelections(selectedClients);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save your selections. Please try again.');
    }
  };

  if (authLoading || prefsLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Select Clients
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Select the clients you want to monitor for spend wastage actions.
          </Typography>

          {(error || prefsError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || prefsError}
            </Alert>
          )}

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="agency-select-label">Agency</InputLabel>
                <Select
                  labelId="agency-select-label"
                  value={selectedAgency}
                  label="Agency"
                  onChange={handleAgencyChange}
                >
                  <MenuItem value="">All Agencies</MenuItem>
                  {agencyIds.map(agencyId => (
                    <MenuItem key={agencyId} value={agencyId}>
                      {agencyId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Search Clients"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSelections}
                disabled={selectedClients.length === 0}
                sx={{ minWidth: '200px' }}
              >
                Save and Continue
              </Button>
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Selected Clients Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Selected Clients ({selectedClients.length})
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : selectedClients.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2 }}>
                  No clients selected yet. Select clients from the Available Clients section below.
                </Typography>
              ) : (
                <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  {clients
                    .filter(client => selectedClients.includes(client.client_id))
                    .map((client, index) => (
                      <React.Fragment key={client.client_id}>
                        <ListItem>
                          <Checkbox
                            edge="start"
                            checked={true}
                            onChange={() => handleClientToggle(client.client_id)}
                          />
                          <ListItemText
                            primary={client.client_name}
                            secondary={`Agency: ${client.agency_id} | ID: ${client.client_id}`}
                          />
                        </ListItem>
                        {index < selectedClients.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                </List>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Available Clients Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Checkbox
                  checked={areAllAvailableSelected}
                  onChange={handleSelectAllAvailable}
                  size="small"
                />
                <Typography variant="h6">
                  Available Clients ({filteredClients.length})
                </Typography>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredClients.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2 }}>
                  No clients found matching your criteria.
                </Typography>
              ) : (
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {filteredClients.map((client, index) => (
                    <React.Fragment key={client.client_id}>
                      <ListItem>
                        <Checkbox
                          edge="start"
                          checked={selectedClients.includes(client.client_id)}
                          onChange={() => handleClientToggle(client.client_id)}
                        />
                        <ListItemText
                          primary={client.client_name}
                          secondary={`Agency: ${client.agency_id} | ID: ${client.client_id}`}
                        />
                      </ListItem>
                      {index < filteredClients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ClientSelectionPage; 