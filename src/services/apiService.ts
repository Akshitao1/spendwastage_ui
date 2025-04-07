import apiClient from './axiosConfig';
import { Client, SpendWastageAction } from '../types';

// Fetch all clients
export const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<Client[]>('/clients/simple');
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Fetch clients filtered by agency ID
export const fetchClientsByAgency = async (agencyId: string): Promise<Client[]> => {
  try {
    const allClients = await fetchClients();
    // Check if allClients is an array, if not, convert to empty array
    const clientsArray = Array.isArray(allClients) ? allClients : [];
    return clientsArray.filter(client => client.agency_id === agencyId);
  } catch (error) {
    console.error('Error fetching clients by agency:', error);
    return [];
  }
};

// Get all unique agency IDs from clients
export const getUniqueAgencyIds = async (): Promise<string[]> => {
  try {
    const allClients = await fetchClients();
    // Check if allClients is an array, if not, convert to empty array
    const clientsArray = Array.isArray(allClients) ? allClients : [];
    const agencyIdsSet = new Set(clientsArray.map(client => client.agency_id));
    const agencyIds = Array.from(agencyIdsSet);
    return agencyIds;
  } catch (error) {
    console.error('Error getting unique agency IDs:', error);
    return [];
  }
};

// Format date as YYYY-MM-DD
const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get default start date (1st of current month)
export const getDefaultStartDate = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

// Get default end date (today)
export const getDefaultEndDate = (): Date => {
  return new Date();
};

// Fetch spend wastage actions
export const fetchSpendWastageActions = async (
  clientIds: string[],
  startDate: Date = getDefaultStartDate(),
  endDate: Date = getDefaultEndDate()
): Promise<SpendWastageAction[]> => {
  if (!clientIds.length) {
    return [];
  }

  try {
    const startDateFormatted = formatDateForApi(startDate);
    const endDateFormatted = formatDateForApi(endDate);
    const clientIdsParam = clientIds.join(',');

    const response = await apiClient.get<SpendWastageAction[]>(
      '/spendwastageactions',
      {
        params: {
          client_ids: clientIdsParam,
          start_date: startDateFormatted,
          end_date: endDateFormatted
        }
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching spend wastage actions:', error);
    return [];
  }
}; 