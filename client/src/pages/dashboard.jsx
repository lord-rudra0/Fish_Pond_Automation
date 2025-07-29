import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Plus } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


import SensorCard from "@/components/sensor-card";
import AlertsPanel from "@/components/alerts-panel";
import SensorChart from "@/components/sensor-chart";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sensor data
  const { data: sensorReadings = [], isLoading: isLoadingSensors, refetch: refetchSensors } = useQuery({
    queryKey: ['/api/sensor-data'],
    queryParams: { limit: 50 },
    refetchInterval: 30000, // Refetch every 30 seconds
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
    queryKey: ['/api/alerts/unacknowledged']
  });

  const hasActiveAlerts = unacknowledgedAlerts.length > 0;
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="space-y-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pond Monitoring Dashboard</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Real-time sensor data and system status</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoadingSensors}
                className="bg-primary text-white hover:bg-blue-700"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingSensors ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                onClick={handleAddDummyData}
                disabled={addDummyDataMutation.isPending}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Test Data
              </Button>
              <Button variant="outline" className="text-gray-700 dark:text-gray-300">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {hasActiveAlerts && (
          <div className="mb-6">
            <Card className={`border ${criticalAlerts.length > 0 ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${criticalAlerts.length > 0 ? 'bg-red-100 dark:bg-red-800' : 'bg-orange-100 dark:bg-orange-800'}`}>
                      <span className="text-lg">{criticalAlerts.length > 0 ? '🚨' : '⚠️'}</span>
                    </div>
                    <div>
                      <h3 className={`text-sm font-medium ${criticalAlerts.length > 0 ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                        {criticalAlerts.length > 0 ? 'Critical Alert' : 'System Alert'}
                      </h3>
                      <p className={`text-sm ${criticalAlerts.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'}`}>
                        {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length > 1 ? 's' : ''} require attention.
                      </p>
                    </div>
                  </div>
                  <Badge variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}>
                    {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sensor Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
          <Card className="bg-surface dark:bg-card">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-lg">⚙️</span>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Configure Thresholds</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Set custom threshold values for each sensor type to receive timely alerts.</p>
              <Button className="w-full bg-primary text-white hover:bg-blue-700">
                Open Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-surface dark:bg-card">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-lg">📊</span>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Historical Reports</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">View detailed historical data and generate reports for pond management.</p>
              <Button className="w-full bg-secondary text-white hover:bg-green-700">
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-surface dark:bg-card">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-lg">📱</span>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Mobile App</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Download our mobile app for real-time monitoring on the go.</p>
              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                Download App
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
