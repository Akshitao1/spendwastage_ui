import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { useAuth } from 'react-oidc-context';
import { UserPreferences } from '../types';

interface UserPreferencesContextType {
  selectedClientIds: string[];
  isLoading: boolean;
  error: string | null;
  saveClientSelections: (clientIds: string[]) => Promise<void>;
  hasInitialClientSelections: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Configure DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const auth = useAuth();
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialClientSelections, setHasInitialClientSelections] = useState<boolean>(false);

  // Get user email from the OIDC user profile
  const userEmail = auth.user?.profile?.email;
  const isAuthenticated = auth.isAuthenticated;

  // Fetch user preferences from DynamoDB when authenticated
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!isAuthenticated || !userEmail) return;

      setIsLoading(true);
      setError(null);

      try {
        const command = new GetCommand({
          TableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME,
          Key: { email: userEmail }
        });

        const response = await docClient.send(command);
        const userPreferences = response.Item as UserPreferences;

        if (userPreferences?.selectedClientIds?.length > 0) {
          setSelectedClientIds(userPreferences.selectedClientIds);
          setHasInitialClientSelections(true);
        } else {
          setSelectedClientIds([]);
          setHasInitialClientSelections(false);
        }
      } catch (err) {
        console.error('Error fetching user preferences:', err);
        setError('Failed to fetch your saved preferences');
        setSelectedClientIds([]);
        setHasInitialClientSelections(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [isAuthenticated, userEmail]);

  // Save client selections to DynamoDB
  const saveClientSelections = async (clientIds: string[]): Promise<void> => {
    if (!isAuthenticated || !userEmail) {
      setError('You must be logged in to save preferences');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const command = new PutCommand({
        TableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME,
        Item: {
          email: userEmail,
          selectedClientIds: clientIds
        }
      });

      await docClient.send(command);
      setSelectedClientIds(clientIds);
      setHasInitialClientSelections(true);
    } catch (err) {
      console.error('Error saving client selections:', err);
      setError('Failed to save your preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        selectedClientIds,
        isLoading,
        error,
        saveClientSelections,
        hasInitialClientSelections
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}; 