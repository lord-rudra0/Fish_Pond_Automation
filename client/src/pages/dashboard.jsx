import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Plus, Fish } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

import SensorCard from "@/components/sensor-card";
import AlertsPanel from "@/components/alerts-panel";
import SensorChart from "@/components/sensor-chart";
import AutoRefreshSettings from "@/components/auto-refresh-settings";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshInterval } = useAutoRefresh();

  // Fetch sensor data
  const { data: sensorReadings = [], isLoading: isLoadingSensors, refetch: refetchSensors } = useQuery({
    queryKey: ['/api/sensor-data'],
    queryParams: { limit: 50 },
    refetchInterval: refreshInterval, // Use user-configured interval
  });

  // Fetch thresholds
  const { data: thresholds = [] } = useQuery({
    queryKey: ['/api/thresholds']
  });

  // Add dummy data mutation
  const addDummyDataMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/sensor-data/dummy'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sensor-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Dummy data added",
        description: "New sensor reading has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add dummy data",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetchSensors();
    queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    toast({
      title: "Data refreshed",
      description: "Sensor readings have been updated.",
    });
  };

  const handleAddDummyData = () => {
    addDummyDataMutation.mutate();
  };

  // Get latest sensor reading
  const latestReading = sensorReadings[0] || {};
  
  // Get alerts for display
  const { data: unacknowledgedAlerts = [] } = useQuery({
    queryKey: ['/api/alerts/unacknowledged'],
    refetchInterval: refreshInterval, // Use user-configured interval
  });

  const hasActiveAlerts = unacknowledgedAlerts.length > 0;
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="min-h-screen gradient-bg">
      <div className="space-y-8 p-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg">
                  <Fish className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    AquaWatch Dashboard
                  </h2>
                  <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">Real-time pond monitoring & analytics</p>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <AutoRefreshSettings />
              <Button
                onClick={handleRefresh}
                disabled={isLoadingSensors}
                className="ocean-gradient text-white hover:shadow-lg hover:shadow-ocean-blue/25 transition-all duration-300"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingSensors ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                onClick={handleAddDummyData}
                disabled={addDummyDataMutation.isPending}
                variant="outline"
                className="hover:bg-seafoam hover:text-white transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Test Data
              </Button>
              <Button 
                variant="outline" 
                className="hover:bg-coral hover:text-white transition-all duration-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {hasActiveAlerts && (
          <div className="mb-6">
            <Card className={`glass-card border-2 ${criticalAlerts.length > 0 ? 'border-red-300 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' : 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${criticalAlerts.length > 0 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-orange-400 to-yellow-500'}`}>
                      <span className="text-2xl">{criticalAlerts.length > 0 ? '🚨' : '⚠️'}</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${criticalAlerts.length > 0 ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                        {criticalAlerts.length > 0 ? 'Critical Alert' : 'System Alert'}
                      </h3>
                      <p className={`text-base ${criticalAlerts.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'}`}>
                        {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length > 1 ? 's' : ''} require immediate attention.
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}
                    className="text-lg px-4 py-2"
                  >
                    {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sensor Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="col-span-full mb-4">
            <h3 className="text-2xl font-bold text-foreground mb-2">Sensor Status</h3>
            <p className="text-muted-foreground">Real-time monitoring of all pond parameters</p>
          </div>
          <SensorCard
            type="ph"
            value={latestReading.ph}
            thresholds={thresholds}
            lastUpdated={latestReading.timestamp}
            colorClass="hover:shadow-blue-100"
          />
          <SensorCard
            type="waterLevel"
            value={latestReading.waterLevel}
            thresholds={thresholds}
            lastUpdated={latestReading.timestamp}
            colorClass="hover:shadow-orange-100"
          />
          <SensorCard
            type="temperature"
            value={latestReading.temperature}
            thresholds={thresholds}
            lastUpdated={latestReading.timestamp}
            colorClass="hover:shadow-green-100"
          />
          <SensorCard
            type="nh3"
            value={latestReading.nh3}
            thresholds={thresholds}
            lastUpdated={latestReading.timestamp}
            colorClass="hover:shadow-red-100"
          />
          <SensorCard
            type="turbidity"
            value={latestReading.turbidity}
            thresholds={thresholds}
            lastUpdated={latestReading.timestamp}
            colorClass="hover:shadow-purple-100"
          />
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SensorChart />
          <AlertsPanel />
        </div>

        {/* Data Table */}
        <Card className="bg-surface dark:bg-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Latest Sensor Readings</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search readings..."
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button variant="outline" size="sm">
                  🔍 Filter
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">pH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Water Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Temperature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NH3</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Turbidity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-surface dark:bg-card divide-y divide-gray-200 dark:divide-gray-700">
                  {sensorReadings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">📊</div>
                        <p className="text-lg font-medium">No sensor data available</p>
                        <p className="text-sm">Add some test data to get started</p>
                      </td>
                    </tr>
                  ) : (
                    sensorReadings.slice(0, 10).map((reading) => {
                      const hasAlerts = unacknowledgedAlerts.some(alert => 
                        new Date(alert.timestamp).getTime() === new Date(reading.timestamp).getTime()
                      );
                      
                      return (
                        <tr key={reading.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {new Date(reading.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {reading.ph ? reading.ph.toFixed(1) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {reading.waterLevel ? `${reading.waterLevel.toFixed(1)} cm` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {reading.temperature ? `${reading.temperature.toFixed(1)}°C` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {reading.nh3 ? `${reading.nh3.toFixed(1)} ppm` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {reading.turbidity ? `${reading.turbidity.toFixed(1)} NTU` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={hasAlerts ? "destructive" : "default"}>
                              {hasAlerts ? "Alert" : "Normal"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {sensorReadings.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing 1 to {Math.min(10, sensorReadings.length)} of {sensorReadings.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cool-card glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl ocean-gradient">
                  <span className="text-xl text-white">⚙️</span>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-foreground">Configure Thresholds</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Set custom threshold values for each sensor type to receive timely alerts.</p>
              <Button className="w-full ocean-gradient text-white hover:shadow-lg hover:shadow-ocean-blue/25 transition-all duration-300">
                Open Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="cool-card glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl seafoam-gradient">
                  <span className="text-xl text-white">📊</span>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-foreground">Historical Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">View detailed historical data and generate reports for pond management.</p>
              <Button className="w-full seafoam-gradient text-white hover:shadow-lg hover:shadow-seafoam/25 transition-all duration-300">
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="cool-card glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl coral-gradient">
                  <span className="text-xl text-white">📱</span>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-foreground">Mobile App</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Download our mobile app for real-time monitoring on the go.</p>
              <Button className="w-full coral-gradient text-white hover:shadow-lg hover:shadow-coral/25 transition-all duration-300">
                Download App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}