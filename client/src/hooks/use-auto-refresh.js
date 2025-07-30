import { useState, useEffect } from 'react';

const REFRESH_OPTIONS = [
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
  { value: 14400, label: '4 hours' },
  { value: 28800, label: '8 hours' },
  { value: 43200, label: '12 hours' },
  { value: 86400, label: '24 hours' },
];

export function useAutoRefresh() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // Default 30 seconds
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false); // Temporarily disable by default

  // Load saved settings from localStorage
  useEffect(() => {
    const savedInterval = localStorage.getItem('autoRefreshInterval');
    const savedEnabled = localStorage.getItem('autoRefreshEnabled');
    
    if (savedInterval) {
      setRefreshInterval(parseInt(savedInterval));
    }
    
    if (savedEnabled !== null) {
      setIsAutoRefreshEnabled(savedEnabled === 'true');
    }
  }, []);

  // Save settings to localStorage
  const updateRefreshInterval = (interval) => {
    setRefreshInterval(interval);
    localStorage.setItem('autoRefreshInterval', interval.toString());
  };

  const toggleAutoRefresh = (enabled) => {
    setIsAutoRefreshEnabled(enabled);
    localStorage.setItem('autoRefreshEnabled', enabled.toString());
  };

  return {
    refreshInterval: isAutoRefreshEnabled ? refreshInterval : false,
    isAutoRefreshEnabled,
    updateRefreshInterval,
    toggleAutoRefresh,
    refreshOptions: REFRESH_OPTIONS,
    currentInterval: refreshInterval
  };
} 