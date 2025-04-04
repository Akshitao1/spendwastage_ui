import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from 'react-oidc-context';

// OIDC Configuration for AWS Cognito
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_84TpztySn",
  client_id: "73t4lujekk043q8mbg1c6qsdaj",
  redirect_uri: window.location.origin || "http://localhost:3000",
  response_type: "code",
  scope: "email openid phone profile",
  // Additional configurations
  onSigninCallback: () => {
    // Prevent the default redirect behavior
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

// Log the exact redirect URI being used for debugging
console.log('OIDC redirect URI:', cognitoAuthConfig.redirect_uri);

// Create the root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the app with the AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to measure performance, pass a function to log results
reportWebVitals(console.log);
