import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, subHours, subWeeks } from 'date-fns';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import AutoRefreshSettings from '@/components/auto-refresh-settings';
import { saveAs } from "file-saver";

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(",")];
  for (const row of data) {
    csvRows.push(keys.map(k => JSON.stringify(row[k] ?? "")).join(","));
  }
  return csvRows.join("\n");
}

const sensorNames = {
  ph: 'pH Level',
  waterLevel: 'Water Level (cm)',
  temperature: 'Temperature (°C)',
  nh3: 'Ammonia (mg/L)',
  turbidity: 'Turbidity (NTU)'
};

const timeRanges = [
  { value: '24h', label: 'Last 24 Hours', days: 1 },
  { value: '7d', label: 'Last 7 Days', days: 7 },
  { value: '30d', label: 'Last 30 Days', days: 30 },
  { value: '90d', label: 'Last 90 Days', days: 90 }
];

export default function History() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedSensor, setSelectedSensor] = useState('all');
  const { refreshInterval } = useAutoRefresh();

  // Get the date range for API query
  const getDateRange = () => {
    const range = timeRanges.find(r => r.value === selectedTimeRange);
    const endDate = new Date();
    const startDate = subDays(endDate, range.days);
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['/api/sensor-data/demo', { 
      startTime: startDate.toISOString(), 
      endTime: endDate.toISOString() 
    }],
    queryFn: () => fetch(`/api/sensor-data/demo?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`).then(res => res.json()),
  });

  // Process data for charts
  const processChartData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.map(reading => ({
      timestamp: new Date(reading.timestamp).getTime(),
      time: format(new Date(reading.timestamp), selectedTimeRange === '24h' ? 'HH:mm' : 'MM/dd'),
      ph: reading.ph,
      waterLevel: reading.waterLevel,
      temperature: reading.temperature,
      nh3: reading.nh3,
      turbidity: reading.turbidity
    })).sort((a, b) => a.timestamp - b.timestamp);
  };

  const chartData = processChartData();

  const handleExportCSV = () => {
    const csv = convertToCSV(historicalData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `pond-data-${selectedTimeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const getSensorColor = (sensor) => {
    const colors = {
      ph: '#8884d8',
      waterLevel: '#82ca9d',
      temperature: '#ffc658',
      nh3: '#ff7300',
      turbidity: '#00c49f'
    };
    return colors[sensor] || '#8884d8';
  };

  const getStats = () => {
    if (!historicalData || historicalData.length === 0) return {};
    
    const stats = {};
    Object.keys(sensorNames).forEach(sensor => {
      const values = historicalData
        .map(reading => reading[sensor])
        .filter(val => val !== null && val !== undefined);
      
      if (values.length > 0) {
        stats[sensor] = {
          avg: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2),
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          latest: values[values.length - 1]?.toFixed(2)
        };
      }
    });
    
    return stats;
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historical Data</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historical Data</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze sensor trends and patterns over time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoRefreshSettings />
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center mb-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            {timeRanges.map(range => (
              <SelectItem key={range.value} value={range.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSensor} onValueChange={setSelectedSensor}>
          <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">All Sensors</SelectItem>
            {Object.entries(sensorNames).map(([key, name]) => (
              <SelectItem key={key} value={key} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartData.length === 0 ? (
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No data available for selected time range</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="h-5 w-5" />
                Sensor Trends
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {selectedSensor === 'all' 
                  ? `All sensors for ${timeRanges.find(r => r.value === selectedTimeRange)?.label.toLowerCase()}` 
                  : `${sensorNames[selectedSensor]} for ${timeRanges.find(r => r.value === selectedTimeRange)?.label.toLowerCase()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `Time: ${value}`}
                      formatter={(value, name) => [
                        value?.toFixed(2) || 'N/A',
                        sensorNames[name] || name
                      ]}
                    />
                    <Legend />
                    {selectedSensor === 'all' ? (
                      Object.keys(sensorNames).map(sensor => (
                        <Line
                          key={sensor}
                          type="monotone"
                          dataKey={sensor}
                          stroke={getSensorColor(sensor)}
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                          name={sensor}
                        />
                      ))
                    ) : (
                      <Line
                        type="monotone"
                        dataKey={selectedSensor}
                        stroke={getSensorColor(selectedSensor)}
                        strokeWidth={2}
                        dot={true}
                        connectNulls={false}
                        name={selectedSensor}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(sensorNames).map(([sensor, name]) => {
              const sensorStats = stats[sensor];
              if (!sensorStats) return null;
              
              return (
                <Card key={sensor} className="bg-white dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold" style={{ color: getSensorColor(sensor) }}>
                      {sensorStats.latest}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <div>Avg: {sensorStats.avg}</div>
                      <div>Min: {sensorStats.min}</div>
                      <div>Max: {sensorStats.max}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}