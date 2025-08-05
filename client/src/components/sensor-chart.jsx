import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

const sensorLabels = {
  ph: "pH Level",
  waterLevel: "Water Level (cm)",
  temperature: "Temperature (°C)",
  nh3: "NH3 Level (ppm)",
  turbidity: "Turbidity (NTU)"
};

const sensorColors = {
  ph: "#3B82F6",
  waterLevel: "#F59E0B",
  temperature: "#10B981", 
  nh3: "#EF4444",
  turbidity: "#8B5CF6"
};

export default function SensorChart() {
  const [selectedSensor, setSelectedSensor] = useState('ph');
  const { refreshInterval } = useAutoRefresh();
  
  // Stabilize the time range to prevent constant re-fetching
  const timeRange = useMemo(() => {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
  }, [Math.floor(Date.now() / (5 * 60 * 1000))]); // Update every 5 minutes

  const { data: sensorData = [], isLoading, error } = useQuery({
    queryKey: ['/api/sensor-data/range', '24h', timeRange.startTime, timeRange.endTime],
    queryFn: () => 
      apiRequest('GET', `/api/sensor-data/range?startTime=${timeRange.startTime}&endTime=${timeRange.endTime}`)
        .then(res => res.json())
        .catch(err => {
          console.error('Error fetching sensor data:', err);
          throw new Error('Failed to fetch sensor data');
        }),
    refetchInterval: Math.max(refreshInterval || 30000, 30000), // Minimum 30 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Debug: Log the response structure
  console.log('Sensor Data Response:', sensorData);
  console.log('Is Array:', Array.isArray(sensorData));
  console.log('Error:', error);

  const chartData = Array.isArray(sensorData) 
    ? sensorData
        .filter(reading => reading && reading[selectedSensor] !== null)
        .map(reading => ({
          timestamp: reading.timestamp,
          value: reading[selectedSensor],
          time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        }))
        .slice(-50) // Show last 50 data points
    : [];

  const formatTooltipValue = (value, name) => {
    if (name === 'value') {
      const unit = selectedSensor === 'ph' ? '' : 
                   selectedSensor === 'waterLevel' ? ' cm' :
                   selectedSensor === 'temperature' ? '°C' :
                   selectedSensor === 'nh3' ? ' ppm' :
                   ' NTU';
      return [`${value}${unit}`, sensorLabels[selectedSensor]];
    }
    return [value, name];
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">24-Hour Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">24-Hour Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-red-500">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">Error Loading Data</p>
              <p className="text-sm opacity-75 text-gray-600 dark:text-gray-300">{error.message || 'Failed to load sensor data'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">24-Hour Trends</CardTitle>
        <div className="flex space-x-2">
          {Object.keys(sensorLabels).map(sensor => (
            <Button
              key={sensor}
              size="sm"
              variant={selectedSensor === sensor ? "default" : "outline"}
              onClick={() => setSelectedSensor(sensor)}
              className={`text-xs px-3 py-1 ${
                selectedSensor === sensor 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4 opacity-75">📊</div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">No Data Available</p>
              <p className="text-sm opacity-75 text-gray-600 dark:text-gray-300">No sensor readings found for the selected time range</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={sensorColors[selectedSensor]}
                  strokeWidth={2}
                  dot={{ fill: sensorColors[selectedSensor], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: sensorColors[selectedSensor], strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
