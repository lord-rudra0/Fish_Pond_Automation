import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const sensorTypes = [
  { value: 'ph', label: 'pH Level', unit: '', min: 0, max: 14 },
  { value: 'waterLevel', label: 'Water Level', unit: 'cm', min: 0, max: 200 },
  { value: 'temperature', label: 'Temperature', unit: '°C', min: 0, max: 50 },
  { value: 'nh3', label: 'NH3 Level', unit: 'ppm', min: 0, max: 10 },
  { value: 'turbidity', label: 'Turbidity', unit: 'NTU', min: 0, max: 100 }
];

export default function Thresholds() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [newThreshold, setNewThreshold] = useState({
    sensorType: '',
    minValue: '',
    maxValue: '',
    alertEnabled: true
  });

  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['/api/thresholds']
  });

  const createThresholdMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/thresholds', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thresholds'] });
      setNewThreshold({ sensorType: '', minValue: '', maxValue: '', alertEnabled: true });
      toast({
        title: "Threshold created",
        description: "New threshold has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create threshold",
        variant: "destructive",
      });
    },
  });

  const updateThresholdMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/thresholds/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thresholds'] });
      setEditingThreshold(null);
      toast({
        title: "Threshold updated",
        description: "Threshold has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update threshold",
        variant: "destructive",
      });
    },
  });

  const deleteThresholdMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/thresholds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thresholds'] });
      toast({
        title: "Threshold deleted",
        description: "Threshold has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete threshold",
        variant: "destructive",
      });
    },
  });

  const handleCreateThreshold = (e) => {
    e.preventDefault();
    
    const data = {
      sensorType: newThreshold.sensorType,
      minValue: newThreshold.minValue ? parseFloat(newThreshold.minValue) : null,
      maxValue: newThreshold.maxValue ? parseFloat(newThreshold.maxValue) : null,
      alertEnabled: newThreshold.alertEnabled
    };

    // Validation
    if (!data.sensorType) {
      toast({
        title: "Validation Error",
        description: "Please select a sensor type",
        variant: "destructive",
      });
      return;
    }

    if (data.minValue === null && data.maxValue === null) {
      toast({
        title: "Validation Error", 
        description: "Please set at least one threshold value",
        variant: "destructive",
      });
      return;
    }

    if (data.minValue !== null && data.maxValue !== null && data.minValue >= data.maxValue) {
      toast({
        title: "Validation Error",
        description: "Minimum value must be less than maximum value",
        variant: "destructive",
      });
      return;
    }

    createThresholdMutation.mutate(data);
  };

  const handleUpdateThreshold = (e) => {
    e.preventDefault();
    
    const data = {
      minValue: editingThreshold.minValue ? parseFloat(editingThreshold.minValue) : null,
      maxValue: editingThreshold.maxValue ? parseFloat(editingThreshold.maxValue) : null,
      alertEnabled: editingThreshold.alertEnabled
    };

    // Validation
    if (data.minValue === null && data.maxValue === null) {
      toast({
        title: "Validation Error",
        description: "Please set at least one threshold value",
        variant: "destructive",
      });
      return;
    }

    if (data.minValue !== null && data.maxValue !== null && data.minValue >= data.maxValue) {
      toast({
        title: "Validation Error",
        description: "Minimum value must be less than maximum value",
        variant: "destructive",
      });
      return;
    }

    updateThresholdMutation.mutate({ id: editingThreshold.id, data });
  };

  const startEditing = (threshold) => {
    setEditingThreshold({
      ...threshold,
      minValue: threshold.minValue?.toString() || '',
      maxValue: threshold.maxValue?.toString() || ''
    });
  };

  const getSensorLabel = (type) => {
    const sensor = sensorTypes.find(s => s.value === type);
    return sensor ? sensor.label : type;
  };

  const getSensorUnit = (type) => {
    const sensor = sensorTypes.find(s => s.value === type);
    return sensor ? sensor.unit : '';
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Threshold Configuration</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set alert thresholds for your sensor readings</p>
      </div>

        {/* Create New Threshold */}
        <Card className="mb-8 bg-surface dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add New Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateThreshold} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="sensorType">Sensor Type</Label>
                  <Select 
                    value={newThreshold.sensorType} 
                    onValueChange={(value) => setNewThreshold(prev => ({ ...prev, sensorType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sensor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sensorTypes
                        .filter(sensor => !thresholds.some(t => t.sensorType === sensor.value))
                        .map(sensor => (
                          <SelectItem key={sensor.value} value={sensor.value}>
                            {sensor.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minValue">Minimum Value</Label>
                  <Input
                    id="minValue"
                    type="number"
                    step="0.1"
                    placeholder="Optional"
                    value={newThreshold.minValue}
                    onChange={(e) => setNewThreshold(prev => ({ ...prev, minValue: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxValue">Maximum Value</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    step="0.1"
                    placeholder="Optional"
                    value={newThreshold.maxValue}
                    onChange={(e) => setNewThreshold(prev => ({ ...prev, maxValue: e.target.value }))}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={createThresholdMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Threshold
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="alertEnabled"
                  checked={newThreshold.alertEnabled}
                  onCheckedChange={(checked) => setNewThreshold(prev => ({ ...prev, alertEnabled: checked }))}
                />
                <Label htmlFor="alertEnabled">Enable alerts for this threshold</Label>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing Thresholds */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Current Thresholds</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : thresholds.length === 0 ? (
            <Card className="bg-surface dark:bg-card">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Thresholds Set</h3>
                <p className="text-gray-500 dark:text-gray-400">Create your first threshold to start receiving alerts when sensor values exceed safe limits.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {thresholds.map((threshold) => (
                <Card key={threshold.id} className="bg-surface dark:bg-card">
                  <CardContent className="p-6">
                    {editingThreshold?.id === threshold.id ? (
                      <form onSubmit={handleUpdateThreshold} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label>Sensor Type</Label>
                            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                              {getSensorLabel(threshold.sensorType)}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="editMinValue">Minimum Value</Label>
                            <Input
                              id="editMinValue"
                              type="number"
                              step="0.1"
                              placeholder="Optional"
                              value={editingThreshold.minValue}
                              onChange={(e) => setEditingThreshold(prev => ({ ...prev, minValue: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="editMaxValue">Maximum Value</Label>
                            <Input
                              id="editMaxValue"
                              type="number"
                              step="0.1"
                              placeholder="Optional"
                              value={editingThreshold.maxValue}
                              onChange={(e) => setEditingThreshold(prev => ({ ...prev, maxValue: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="editAlertEnabled"
                              checked={editingThreshold.alertEnabled}
                              onCheckedChange={(checked) => setEditingThreshold(prev => ({ ...prev, alertEnabled: checked }))}
                            />
                            <Label htmlFor="editAlertEnabled">Enable alerts</Label>
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setEditingThreshold(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={updateThresholdMutation.isPending}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {getSensorLabel(threshold.sensorType)}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {threshold.minValue !== null && `Min: ${threshold.minValue} ${getSensorUnit(threshold.sensorType)}`}
                                  {threshold.minValue !== null && threshold.maxValue !== null && ' • '}
                                  {threshold.maxValue !== null && `Max: ${threshold.maxValue} ${getSensorUnit(threshold.sensorType)}`}
                                </span>
                                <Badge variant={threshold.alertEnabled ? "default" : "secondary"}>
                                  {threshold.alertEnabled ? "Alerts On" : "Alerts Off"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(threshold)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteThresholdMutation.mutate(threshold.id)}
                            disabled={deleteThresholdMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Information Panel */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Threshold Guidelines</h4>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <p>• <strong>pH Level:</strong> Optimal range 6.8-7.5 for most fish species</p>
                  <p>• <strong>Water Level:</strong> Maintain above 70cm for adequate depth</p>
                  <p>• <strong>Temperature:</strong> Keep between 22-26°C for tropical fish</p>
                  <p>• <strong>NH3 Level:</strong> Should remain below 2.0 ppm to prevent toxicity</p>
                  <p>• <strong>Turbidity:</strong> Keep below 20 NTU for clear water visibility</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
