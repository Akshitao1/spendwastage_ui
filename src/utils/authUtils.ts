import { signOut } from 'aws-amplify/auth';

/**
 * Performs a complete logout by:
 * 1. Attempting to sign out from AWS Amplify
 * 2. Clearing all browser storage related to authentication
 * 3. Optionally redirecting to the login page
 */
export const performCompleteLogout = async (redirectPath = '/login'): Promise<void> => {
  try {
    // Try to sign out from AWS Amplify
    try {
      await signOut({ global: true });
    } catch (amplifyError) {
      console.error('Amplify signOut error:', amplifyError);
      // Continue with the process even if Amplify signOut fails
    }

    // Clear all cookies by setting their expiration to past
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Also try to clear cookies with domain and secure attributes
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}; secure;`;
    });

    // Clear localStorage and sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (storageError) {
      console.error('Error clearing storage:', storageError);
    }

    // Specifically target authentication-related storage items
    const storageKeysToRemove = [
      'amplify-signin-with-hostedUI',
      'CognitoIdentityServiceProvider',
      'COGNITO_IDENTITY_IDS',
      'COGNITO_IDENTITY_IDS_BY_ISSUER',
      'oidc.user:',
      'aws.cognito',
      'IMPT' // Common ID token key
    ];

    // Remove specific keys from localStorage
    storageKeysToRemove.forEach(keyPattern => {
      // Try exact matches
      try {
        localStorage.removeItem(keyPattern);
      } catch (e) {}

      // For partial matches, loop through all keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(keyPattern)) {
          try {
            localStorage.removeItem(key);
          } catch (e) {}
        }
      }
    });

    // Add a short delay to allow storage clearing to complete
    if (redirectPath) {
      setTimeout(() => {
        // Force a hard redirect to the login page
        // This ensures a complete page reload which clears any in-memory state
        window.location.href = redirectPath;
      }, 300);
    }
  } catch (error) {
    console.error('Complete logout error:', error);
    // If all else fails, force a hard redirect
    if (redirectPath) {
      window.location.href = redirectPath;
    }
  }
};

/**
 * Clears AWS Cognito cookies by redirecting to Cognito's logout endpoint
 * This is an alternative approach when signOut() doesn't work properly
 */
export const logoutViaCognitoEndpoint = (): void => {
  try {
    // Clear all local storage and cookies first
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Use a simpler approach by just redirecting to login page
    // This avoids dealing with complex Cognito parameter requirements
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback to direct navigation
    window.location.href = '/login';
  }
};

/**
 * Handles logout using the Auth object from react-oidc-context
 * This simpler approach just removes the user and redirects
 * @param auth The auth object from useAuth()
 */
export const handleOidcLogout = (auth: any): void => {
  try {
    // First try to remove the user from the auth context
    if (auth && typeof auth.removeUser === 'function') {
      auth.removeUser();
    }
    
    // Clear storage and cookies
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Redirect to login after a short delay to ensure everything is cleared
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  } catch (error) {
    console.error('OIDC logout error:', error);
    // Fallback - direct navigation
    window.location.href = '/login';
  }
};

/**
 * Complete logout function that works with Cognito by redirecting to their logout endpoint
 * with all required parameters.
 * @param auth The auth object from useAuth() hook
 */
export const completeLogout = (auth: any): void => {
  try {
    // Try to first remove the user from the OIDC context
    if (auth && typeof auth.removeUser === 'function') {
      try {
        auth.removeUser();
      } catch (e) {
        console.error('Error removing user from auth context:', e);
      }
    }
    
    // Clear browser storage
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    } catch (e) {
      console.error('Error clearing browser storage:', e);
    }
    
    // Now build the proper Cognito logout URL with all required parameters
    const cognitoDomain = 'ap-south-184tpztysn.auth.ap-south-1.amazoncognito.com';
    const clientId = '73t4lujekk043q8mbg1c6qsdaj';
    
    // Get the exact origin to use as redirect URI
    const exactOrigin = window.location.origin;
    console.log('Exact redirect origin being used:', exactOrigin);
    
    const redirectUri = encodeURIComponent(exactOrigin);
    const responseType = 'code'; // Required parameter
    
    // Get the ID token if available
    let idTokenParam = '';
    if (auth && auth.user && auth.user.id_token) {
      idTokenParam = `&id_token_hint=${auth.user.id_token}`;
    }

    // Construct the complete logout URL with all required parameters
    const logoutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}${idTokenParam}`;
    
    console.log('Redirecting to Cognito logout URL:', logoutUrl);
    
    // Redirect to the Cognito logout endpoint
    window.location.href = logoutUrl;
  } catch (error) {
    console.error('Complete logout error:', error);
    // Fallback - just clear what we can and redirect
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
}; 