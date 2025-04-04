# Joveo Spend Wastage Actions Application

A web application allowing Joveo employees to log in securely via Google (restricted to @joveo.com accounts) and view client-specific spend wastage actions.

## Features

- **Secure Authentication**: AWS Cognito with Google Identity Provider (restricted to @joveo.com domains)
- **Client Selection**: Filter and select clients to monitor
- **User Preferences**: Save selected clients in AWS DynamoDB for future sessions
- **Spend Wastage Actions**: View detailed spend wastage actions for selected clients
- **Date Range Filtering**: Filter actions by custom date ranges

## Tech Stack

- **Frontend**: React.js with TypeScript, Material UI for components
- **Authentication**: AWS Cognito with Google Identity Provider
- **Database**: AWS DynamoDB for storing user preferences
- **API**: External API for fetching clients and spend wastage actions
- **Environment Configuration**: Environment variables via .env file

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- AWS account with Cognito User Pool configured for Google authentication
- DynamoDB table for storing user preferences

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   

4. Start the development server:
   ```
   npm start
   ```

5. Build for production:
   ```
   npm run build
   ```

## User Flow

1. **Login**: Users login with their Joveo Google account
2. **Client Selection**: First-time users select clients to monitor
3. **Dashboard**: View spend wastage actions for selected clients
4. **Filters**: Apply date range filters to refine results

## API Endpoints

The application uses the following API endpoints:

- **Fetch Clients**: `https://atvisualbe.vercel.app/api/clients/simple`
- **Fetch Spend Wastage Actions**: `https://atvisualbe.vercel.app/api/spendwastageactions?client_ids=<comma_separated_client_ids>&start_date=<YYYY-MM-DD>&end_date=<YYYY-MM-DD>`

## Authentication Details

- **User Pool Name**: 2smfmy
- **User Pool ID**: ap-south-1_84TpztySn
- **App Client Name**: atlogsiter1
- **Client ID**: 73t4lujekk043q8mbg1c6qsdaj
- **Identity Provider**: Google
- **Allowed Users**: Only Google accounts with domain @joveo.com

## DynamoDB Configuration

- **Table Name**: spendwastagealgo
- **Partition Key**: email (String)
- **Mode**: On-demand

## Security Considerations

- Environment variables contain sensitive information and should be protected
- Access to the application is restricted to @joveo.com email domains
- AWS credentials have been included for demonstration purposes but should be rotated in a production environment

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify that your .env file contains all required variables
3. Ensure AWS credentials have appropriate permissions
4. Confirm Cognito User Pool is correctly configured for Google authentication
