import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Droplets, Thermometer, Activity, FlaskConical, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import AutoRefreshSettings from '@/components/auto-refresh-settings';

const sensorIcons = {
  ph: FlaskConical,
  waterLevel: Droplets,
  temperature: Thermometer,
  nh3: Activity,
  turbidity: Eye
};

const sensorUnits = {
  ph: '',
  waterLevel: 'cm',
  temperature: '°C',
  nh3: 'mg/L',
  turbidity: 'NTU'
};

const sensorNames = {
  ph: 'pH Level',
  waterLevel: 'Water Level',
  temperature: 'Temperature',
  nh3: 'Ammonia (NH3)',
  turbidity: 'Turbidity'
};

export default function Sensors() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshInterval } = useAutoRefresh();

  const { data: sensorData, isLoading, refetch } = useQuery({
    queryKey: ['/api/sensor-data'],
    refetchInterval: refreshInterval, // Use user-configured interval
  });

  const { data: thresholds } = useQuery({
    queryKey: ['/api/thresholds'],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Data refreshed",
        description: "Sensor readings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to update sensor readings.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getLatestReading = () => {
    if (!sensorData || sensorData.length === 0) return null;
    return sensorData[sensorData.length - 1];
  };

  const getSensorStatus = (sensorType, value) => {
    if (!thresholds || value === null || value === undefined) return 'unknown';
    
    const threshold = thresholds.find(t => t.sensorType === sensorType);
    if (!threshold) return 'unknown';
    
    if (value < threshold.minValue || value > threshold.maxValue) {
      return 'critical';
    }
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const latestReading = getLatestReading();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sensor Status</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sensor Status</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of all pond sensors
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <AutoRefreshSettings />
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {!latestReading ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No sensor data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(sensorNames).map(([sensorType, displayName]) => {
            const value = latestReading[sensorType];
            const status = getSensorStatus(sensorType, value);
            const Icon = sensorIcons[sensorType];
            const unit = sensorUnits[sensorType];
            
            return (
              <Card key={sensorType} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {displayName}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {value !== null && value !== undefined ? `${value}${unit}` : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(latestReading.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status === 'normal' ? 'Normal' : status === 'critical' ? 'Alert' : 'Unknown'}
                    </Badge>
                  </div>
                  
                  {thresholds && thresholds.find(t => t.sensorType === sensorType) && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Safe range: {thresholds.find(t => t.sensorType === sensorType).minValue} - {thresholds.find(t => t.sensorType === sensorType).maxValue}{unit}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current status and data collection details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Total Readings</p>
              <p className="text-gray-600 dark:text-gray-400">{sensorData?.length || 0}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Last Update</p>
              <p className="text-gray-600 dark:text-gray-400">
                {latestReading ? new Date(latestReading.timestamp).toLocaleString() : 'No data'}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Active Sensors</p>
              <p className="text-gray-600 dark:text-gray-400">5 sensors online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}