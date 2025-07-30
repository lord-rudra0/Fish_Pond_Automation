import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Clock, RefreshCw } from 'lucide-react';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

export default function AutoRefreshSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    refreshInterval,
    isAutoRefreshEnabled,
    updateRefreshInterval,
    toggleAutoRefresh,
    refreshOptions,
    currentInterval
  } = useAutoRefresh();

  const getCurrentIntervalLabel = () => {
    const option = refreshOptions.find(opt => opt.value * 1000 === currentInterval);
    return option ? option.label : 'Custom';
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>Auto Refresh</span>
        {isAutoRefreshEnabled && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400">
              {getCurrentIntervalLabel()}
            </span>
          </div>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Auto Refresh Settings</span>
            </CardTitle>
            <CardDescription>
              Configure automatic data refresh intervals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable/Disable Auto Refresh */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Enable Auto Refresh</label>
                <p className="text-xs text-muted-foreground">
                  Automatically update data at regular intervals
                </p>
              </div>
              <Switch
                checked={isAutoRefreshEnabled}
                onCheckedChange={toggleAutoRefresh}
              />
            </div>

            {/* Refresh Interval Selection */}
            {isAutoRefreshEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Refresh Interval</label>
                <Select
                  value={(currentInterval / 1000).toString()}
                  onValueChange={(value) => updateRefreshInterval(parseInt(value) * 1000)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {refreshOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Indicator */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status:</span>
                <div className="flex items-center space-x-1">
                  {isAutoRefreshEnabled ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 dark:text-green-400">
                        Active - {getCurrentIntervalLabel()}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-500">Disabled</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 