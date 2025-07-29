import mongoose from "mongoose";
import { z } from "zod";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Sensor Data Schema
const sensorDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  ph: { type: Number },
  waterLevel: { type: Number },
  temperature: { type: Number },
  nh3: { type: Number },
  turbidity: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

// Thresholds Schema
const thresholdSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sensorType: { type: String, required: true }, // 'ph', 'waterLevel', 'temperature', 'nh3', 'turbidity'
  minValue: { type: Number },
  maxValue: { type: Number },
  alertEnabled: { type: Boolean, default: true }
});

// Alerts Schema
const alertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sensorType: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, required: true }, // 'normal', 'warning', 'critical'
  value: { type: Number },
  threshold: { type: Number },
  acknowledged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.model('User', userSchema);
export const SensorData = mongoose.model('SensorData', sensorDataSchema);
export const Threshold = mongoose.model('Threshold', thresholdSchema);
export const Alert = mongoose.model('Alert', alertSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

export const insertSensorDataSchema = z.object({
  userId: z.string(),
  ph: z.number().optional(),
  waterLevel: z.number().optional(),
  temperature: z.number().optional(),
  nh3: z.number().optional(),
  turbidity: z.number().optional()
});

export const insertThresholdSchema = z.object({
  userId: z.string(),
  sensorType: z.string(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  alertEnabled: z.boolean().default(true)
});

export const insertAlertSchema = z.object({
  userId: z.string(),
  sensorType: z.string(),
  message: z.string(),
  severity: z.string(),
  value: z.number().optional(),
  threshold: z.number().optional(),
  acknowledged: z.boolean().default(false)
});