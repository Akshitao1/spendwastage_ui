import { Amplify } from 'aws-amplify';
// We're not using defaultStorage right now, so removing the import

// Initialize AWS Amplify with environment variables
export const configureAmplify = () => {
  try {
    // Fixed Cognito domain provided by user (without https:// prefix)
    const cognitoDomain = "ap-south-184tpztysn.auth.ap-south-1.amazoncognito.com";
    
    // Use multiple possible redirect URLs to handle different development environments
    // This is particularly important for OAuth flows
    const redirectUrls = [
      'http://localhost:3000',
      'http://localhost:3001',
      window.location.origin, // Include the actual running origin
      'https://spendwastage.vercel.app' // Add Vercel URL explicitly
    ];
    
    // Basic Amplify configuration with AWS Amplify v6 format
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'ap-south-1_84TpztySn',
          userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '73t4lujekk043q8mbg1c6qsdaj',
          loginWith: {
            oauth: {
              domain: cognitoDomain,
              scopes: ['email', 'profile', 'openid'],
              redirectSignIn: redirectUrls,
              redirectSignOut: redirectUrls,
              responseType: 'code'
            }
          }
        }
      }
    });
  } catch (error) {
    throw error; // Rethrow to allow the calling code to handle it
  }
}; 