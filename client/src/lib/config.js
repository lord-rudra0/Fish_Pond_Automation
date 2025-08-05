// Environment configuration
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

export const config = {
  // API configuration
  apiBaseUrl: isDevelopment 
    ? '' // Use relative URLs in development (proxy will handle it)
    : 'https://fish-pond-automation-w87h.vercel.app',
  
  // App configuration
  appName: 'Fish Pond Automation',
  appVersion: '1.0.0',
  
  // Feature flags
  features: {
    autoRefresh: true,
    realTimeUpdates: true,
    alerts: true,
  }
};

export default config; 