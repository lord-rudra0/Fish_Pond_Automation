import { Card, CardContent } from "@/components/ui/card";

const getSensorIcon = (type) => {
  const icons = {
    ph: "🧪",
    waterLevel: "💧",
    temperature: "🌡️",
    nh3: "⚗️",
    turbidity: "👁️"
  };
  return icons[type] || "📊";
};

const getSensorUnit = (type) => {
  const units = {
    ph: "",
    waterLevel: "cm",
    temperature: "°C",
    nh3: "ppm",
    turbidity: "NTU"
  };
  return units[type] || "";
};

const getSensorLabel = (type) => {
  const labels = {
    ph: "pH Level",
    waterLevel: "Water Level",
    temperature: "Temperature",
    nh3: "NH3 Level",
    turbidity: "Turbidity"
  };
  return labels[type] || type;
};

const getStatusInfo = (type, value, thresholds) => {
  if (value === null || value === undefined) {
    return { status: 'unknown', label: 'No Data' };
  }

  const threshold = thresholds?.find(t => t.sensorType === type);
  if (!threshold) {
    return { status: 'normal', label: 'Normal' };
  }

  if (threshold.minValue !== null && value < threshold.minValue) {
    return { status: 'critical', label: 'Low' };
  }
  if (threshold.maxValue !== null && value > threshold.maxValue) {
    return { status: 'critical', label: 'High' };
  }
  
  // Warning zone (within 10% of threshold)
  if (threshold.minValue !== null && value < threshold.minValue * 1.1) {
    return { status: 'warning', label: 'Warning' };
  }
  if (threshold.maxValue !== null && value > threshold.maxValue * 0.9) {
    return { status: 'warning', label: 'Warning' };
  }

  return { status: 'normal', label: 'Normal' };
};

const getThresholdDisplay = (type, thresholds) => {
  const threshold = thresholds?.find(t => t.sensorType === type);
  if (!threshold) return "No threshold set";
  
  const unit = getSensorUnit(type);
  if (threshold.minValue !== null && threshold.maxValue !== null) {
    return `${threshold.minValue} - ${threshold.maxValue} ${unit}`;
  } else if (threshold.minValue !== null) {
    return `> ${threshold.minValue} ${unit}`;
  } else if (threshold.maxValue !== null) {
    return `< ${threshold.maxValue} ${unit}`;
  }
  return "No threshold set";
};

export default function SensorCard({ type, value, thresholds, lastUpdated, colorClass }) {
  const statusInfo = getStatusInfo(type, value, thresholds);
  const unit = getSensorUnit(type);
  const label = getSensorLabel(type);
  const icon = getSensorIcon(type);
  const thresholdDisplay = getThresholdDisplay(type, thresholds);

  const formatValue = (val) => {
    if (val === null || val === undefined) return "N/A";
    return typeof val === 'number' ? val.toFixed(1) : val;
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "No data";
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMinutes = Math.floor((now - updated) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 min ago";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return updated.toLocaleDateString();
  };

  return (
    <Card className={`sensor-card bg-surface dark:bg-card border border-gray-100 dark:border-gray-800 ${colorClass}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              type === 'ph' ? 'bg-blue-50 dark:bg-blue-900/20' :
              type === 'waterLevel' ? 'bg-orange-50 dark:bg-orange-900/20' :
              type === 'temperature' ? 'bg-green-50 dark:bg-green-900/20' :
              type === 'nh3' ? 'bg-red-50 dark:bg-red-900/20' :
              'bg-purple-50 dark:bg-purple-900/20'
            }`}>
              <span className="text-lg">{icon}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
              <p className={`status-indicator status-${statusInfo.status} text-xs text-gray-500 dark:text-gray-400 pl-4`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono">
          {formatValue(value)} {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Target: {thresholdDisplay}
        </div>
        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>
      </CardContent>
    </Card>
  );
}
