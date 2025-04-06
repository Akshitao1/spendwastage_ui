import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { signOut, getCurrentUser, fetchUserAttributes, signInWithRedirect } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { User } from '../types';

// Extended Hub payload interface to handle error data
interface AuthHubPayload {
  event: string;
  message?: string;
  data?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      try {
        // Try to get current user - this just checks if there's a session
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const currentUser = await getCurrentUser();
        
        try {
          // Try to get user attributes
          const userAttributes = await fetchUserAttributes();
          
          // Check if email domain is @joveo.com
          if (userAttributes.email && userAttributes.email.endsWith('@joveo.com')) {
            const username = userAttributes.email.split('@')[0];
            setUser({
              email: userAttributes.email,
              name: userAttributes.name || username,
              picture: userAttributes.picture,
              username: username,
              sub: userAttributes.sub || ''
            });
            setIsAuthenticated(true);
          } else {
            // If email domain is not @joveo.com, log the user out
            await signOut();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (attributeError) {
          // If we get NotAuthorizedException, clear the session and force re-auth
          if (attributeError instanceof Error && attributeError.name === 'NotAuthorizedException') {
            await signOut();
          }
          
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    try {
      // First check if a user is already authenticated to avoid errors
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const userSession = await getCurrentUser();
        // If we reach here without error, a session exists
        
        try {
          // Try to validate the session by getting user attributes
          await fetchUserAttributes();
          await checkUser();
          return;
        } catch (sessionError) {
          // Session exists but is invalid, force sign out
          if (sessionError instanceof Error && sessionError.name === 'NotAuthorizedException') {
            await signOut();
          }
        }
      } catch (userCheckError) {
        // No user is authenticated, proceed with sign in
      }

      // This will redirect to the Cognito hosted UI for Google authentication
      await signInWithRedirect({ 
        provider: 'Google'
      });
    } catch (error) {
      // Handle silently
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // We can use our more comprehensive logout function
      // Since this is inside a function that returns a Promise, 
      // we need to create a special version that doesn't redirect right away
      try {
        // Try to sign out from AWS Amplify
        await signOut({ global: true });
      } catch (amplifyError) {
        // Handle silently
      }
      
      // Always clear the local state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Still clear the local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkUser();
    
    // Set up listener for auth state changes
    const handleAuthChange = async () => {
      await checkUser();
    };
    
    // Subscribe to auth events
    const unsubscribe = Hub.listen('auth', (data) => {
      // Cast payload to our extended interface
      const payload = data.payload as AuthHubPayload;
      
      switch (payload.event) {
        case 'signIn':
        case 'tokenRefresh':
          handleAuthChange();
          break;
        case 'signOut':
          setUser(null);
          setIsAuthenticated(false);
          break;
        case 'signInWithRedirect':
          // Handle silently
          break;
        case 'signInWithRedirect_failure':
          // Handle silently
          break;
        default:
          // Handle silently
          break;
      }
    });

    return () => {
      // Cleanup subscription
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 