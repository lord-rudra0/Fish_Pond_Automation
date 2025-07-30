import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

const getAlertIcon = (severity) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="text-red-500" size={16} />;
    case 'warning':
      return <AlertTriangle className="text-orange-500" size={16} />;
    default:
      return <CheckCircle className="text-green-500" size={16} />;
  }
};

const getAlertBgColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'warning':
      return 'bg-orange-50 dark:bg-orange-900/20';
    default:
      return 'bg-green-50 dark:bg-green-900/20';
  }
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMinutes = Math.floor((now - alertTime) / (1000 * 60));
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  return alertTime.toLocaleDateString();
};

export default function AlertsPanel() {
  const queryClient = useQueryClient();
  const { refreshInterval } = useAutoRefresh();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/alerts'],
    queryParams: { limit: 10 },
    refetchInterval: refreshInterval, // Use user-configured interval
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId) => apiRequest('PUT', `/api/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/unacknowledged'] });
    },
  });

  const handleAcknowledge = (alertId) => {
    acknowledgeMutation.mutate(alertId);
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <p className="text-lg font-medium">All Clear!</p>
              <p className="text-sm">No recent alerts to display</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${getAlertBgColor(alert.severity)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {alert.sensorType.charAt(0).toUpperCase() + alert.sensorType.slice(1)} Alert
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 
                                alert.severity === 'warning' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <X size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
