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
    <Card className={`sensor-card cool-card glow-effect ${colorClass} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl ${
              type === 'ph' ? 'ocean-gradient' :
              type === 'waterLevel' ? 'coral-gradient' :
              type === 'temperature' ? 'seafoam-gradient' :
              type === 'nh3' ? 'bg-gradient-to-r from-red-400 to-red-600' :
              'bg-gradient-to-r from-purple-400 to-purple-600'
            }`}>
              <span className="text-xl text-white">{icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className={`status-indicator status-${statusInfo.status} text-xs text-gray-600 dark:text-gray-300 pl-4`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono mb-2">
          {formatValue(value)} {unit && <span className="text-sm text-gray-600 dark:text-gray-300">{unit}</span>}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
          Target: {thresholdDisplay}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>
      </CardContent>
    </Card>
  );
}
