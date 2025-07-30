import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fish } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

import SensorCard from "@/components/sensor-card";
import AlertsPanel from "@/components/alerts-panel";
import SensorChart from "@/components/sensor-chart";
import AutoRefreshSettings from "@/components/auto-refresh-settings";



function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [customCity, setCustomCity] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Fallback to default location
          setLocation({ lat: null, lon: null });
        }
      );
    } else {
      console.log('Geolocation not supported');
      setLocation({ lat: null, lon: null });
    }
  }, []);
  
  // Fetch weather data when location is available
  useEffect(() => {
    if (location === null) return; // Still getting location
    
    setLoading(true);
    setError(null);
    
    let url = '/api/weather';
    if (customCity) {
      url += `?city=${encodeURIComponent(customCity)}`;
    } else if (location.lat && location.lon) {
      url += `?lat=${location.lat}&lon=${location.lon}`;
    }
    
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Weather data received:', data);
        if (data.error) {
          throw new Error(data.error.message || 'Weather API error');
        }
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Weather fetch error:', err);
        setError(err.message || 'Failed to load weather');
        setLoading(false);
      });
  }, [location, customCity]);
  
  const handleCustomCitySubmit = (e) => {
    e.preventDefault();
    if (customCity.trim()) {
      setShowLocationInput(false);
    }
  };
  
  const resetToCurrentLocation = () => {
    setCustomCity('');
    setShowLocationInput(false);
  };
  
  if (loading) return <div className="text-sm text-gray-400">Loading weather...</div>;
  if (error) return <div className="text-sm text-red-400">Weather: {error}</div>;
  if (!weather || !weather.current) return <div className="text-sm text-red-400">Weather data unavailable</div>;
  
  return (
    <div className="relative flex items-center space-x-4 bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-2 shadow">
      {/* Weather Icon & Temperature */}
      <div className="flex items-center space-x-2">
        <img src={weather.current.condition.icon} alt={weather.current.condition.text} className="h-8 w-8" />
        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{weather.current.temp_c}°C</span>
      </div>
      
      {/* Weather Condition */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{weather.current.condition.text}</span>
      </div>
      
      {/* Location Info */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{weather.location.name}</span>
        {customCity ? (
          <span className="text-xs text-blue-500">📍 Custom</span>
        ) : location && location.lat && location.lon ? (
          <span className="text-xs text-green-500">📍 Your location</span>
        ) : (
          <span className="text-xs text-orange-500">📍 Default</span>
        )}
      </div>
      
      {/* Additional Weather Data */}
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <span>💧 {weather.current.humidity}%</span>
        <span>💨 {weather.current.wind_speed} m/s</span>
        <span>📊 {weather.current.pressure} hPa</span>
      </div>
      
      {/* Location Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setShowLocationInput(!showLocationInput)}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Change location"
        >
          📍
        </button>
        {customCity && (
          <button
            onClick={resetToCurrentLocation}
            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Reset to current location"
          >
            🔄
          </button>
        )}
      </div>
      
      {/* Location Input (appears below when active) */}
      {showLocationInput && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <form onSubmit={handleCustomCitySubmit} className="flex space-x-2">
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowLocationInput(false)}
              className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

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
                  {/* <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    AquaWatch Dashboard
                  </h2> */}
                  <WeatherWidget />
                  {/* <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">Real-time pond monitoring & analytics</p> */}
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <AutoRefreshSettings />
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