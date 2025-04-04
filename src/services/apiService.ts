import axios from 'axios';
import { Client, SpendWastageAction } from '../types';

// Use relative URL for development proxy
const API_BASE_URL = '/api';

// Fetch all clients
export const fetchClients = async (): Promise<Client[]> => {
  try {
    const url = `${API_BASE_URL}/clients/simple`;
    console.log('Fetching clients from:', url);
    const response = await axios.get<Client[]>(url);
    console.log('Clients API Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching clients:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error('Error fetching clients:', error);
    }
    throw error;
  }
};

// Fetch clients filtered by agency ID
export const fetchClientsByAgency = async (agencyId: string): Promise<Client[]> => {
  try {
    const allClients = await fetchClients();
    return allClients.filter(client => client.agency_id === agencyId);
  } catch (error) {
    console.error('Error fetching clients by agency:', error);
    throw error;
  }
};

// Get all unique agency IDs from clients
export const getUniqueAgencyIds = async (): Promise<string[]> => {
  try {
    const allClients = await fetchClients();
    const agencyIdsSet = new Set(allClients.map(client => client.agency_id));
    const agencyIds = Array.from(agencyIdsSet);
    return agencyIds;
  } catch (error) {
    console.error('Error getting unique agency IDs:', error);
    throw error;
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

    const response = await axios.get<SpendWastageAction[]>(
      `${API_BASE_URL}/spendwastageactions`,
      {
        params: {
          client_ids: clientIdsParam,
          start_date: startDateFormatted,
          end_date: endDateFormatted
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching spend wastage actions:', error);
    throw error;
  }
}; 