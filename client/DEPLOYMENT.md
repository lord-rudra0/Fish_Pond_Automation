# Fish Pond Automation - Deployment Guide

## Overview
This application consists of two parts:
- **Client**: React frontend deployed at https://fish-pond-automation.vercel.app/
- **Server**: Node.js API backend deployed at https://fish-pond-automation-w87h.vercel.app/

## Configuration

### Client Configuration
The client is configured to automatically detect the environment:
- **Development**: Uses relative URLs with Vite proxy
- **Production**: Points to the deployed server URL

Key configuration files:
- `src/lib/config.js` - Environment-specific settings
- `src/lib/queryClient.js` - API request handling
- `vite.config.js` - Build configuration

### Server Configuration
The server includes CORS configuration to allow requests from the client domain:
- CORS origin: `https://fish-pond-automation.vercel.app`
- Supports all HTTP methods
- Includes Authorization header support

## Deployment Steps

### 1. Deploy Server
```bash
cd server
vercel --prod
```

### 2. Deploy Client
```bash
cd client
vercel --prod
```

### 3. Verify Configuration
After deployment, verify:
1. Server is accessible at the deployed URL
2. Client can make API calls to the server
3. Authentication works properly
4. All features are functional

## Troubleshooting

### CORS Issues
If you see CORS errors:
1. Check that the server's CORS configuration includes the correct client URL
2. Verify the client is using the correct server URL in production

### API Connection Issues
If API calls fail:
1. Check that the server is running and accessible
2. Verify the API_BASE_URL in the client configuration
3. Check server logs for any errors

### Authentication Issues
If login/registration fails:
1. Check database connectivity
2. Verify JWT secret is properly configured
3. Check server logs for authentication errors

## Environment Variables

### Server Environment Variables
- `NODE_ENV` - Set to 'production' for production builds
- `PORT` - Server port (Vercel sets this automatically)
- `OPENWEATHER_API_KEY` - For weather data (if used)

### Client Environment Variables
- `NODE_ENV` - Set to 'production' for production builds
- `VITE_API_URL` - Override API URL (optional, defaults to server URL)

## Security Notes
- JWT secret should be changed in production
- Database credentials should be secured
- CORS is configured to only allow the specific client domain 