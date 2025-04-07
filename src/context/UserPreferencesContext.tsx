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

// Check if we have actual AWS credentials
const hasValidCredentials = !!(
  process.env.REACT_APP_AWS_ACCESS_KEY_ID && 
  process.env.REACT_APP_AWS_ACCESS_KEY_ID.length > 0 &&
  process.env.REACT_APP_AWS_SECRET_ACCESS_KEY && 
  process.env.REACT_APP_AWS_SECRET_ACCESS_KEY.length > 0
);

// Only create the DynamoDB client if we have credentials
let dynamoClient: DynamoDBClient | null = null;
let docClient: any = null;

if (hasValidCredentials) {
  try {
    dynamoClient = new DynamoDBClient({
      region: process.env.REACT_APP_AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
      }
    });
    
    docClient = DynamoDBDocumentClient.from(dynamoClient);
  } catch (error) {
    dynamoClient = null;
    docClient = null;
  }
}

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
        // Check if DynamoDB client is available
        if (!docClient) {
          // Fallback to using localStorage if DynamoDB is not available
          const storedPrefs = localStorage.getItem(`userPrefs_${userEmail}`);
          if (storedPrefs) {
            const userPreferences = JSON.parse(storedPrefs);
            setSelectedClientIds(userPreferences.selectedClientIds || []);
            setHasInitialClientSelections(true);
          } else {
            setSelectedClientIds([]);
            setHasInitialClientSelections(false);
          }
          return;
        }

        const command = new GetCommand({
          TableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME || 'spendwastage-user-preferences',
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
      // Check if DynamoDB client is available
      if (!docClient) {
        // Fallback to using localStorage if DynamoDB is not available
        localStorage.setItem(`userPrefs_${userEmail}`, JSON.stringify({
          email: userEmail,
          selectedClientIds: clientIds
        }));
        setSelectedClientIds(clientIds);
        setHasInitialClientSelections(true);
        return;
      }

      const command = new PutCommand({
        TableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME || 'spendwastage-user-preferences',
        Item: {
          email: userEmail,
          selectedClientIds: clientIds
        }
      });

      await docClient.send(command);
      setSelectedClientIds(clientIds);
      setHasInitialClientSelections(true);
    } catch (err) {
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