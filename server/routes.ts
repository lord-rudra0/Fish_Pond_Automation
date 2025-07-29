import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-sqlite";
import { insertUserSchema, insertSensorDataSchema, insertThresholdSchema } from "@shared/schema";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to check thresholds and create alerts
const checkThresholds = async (userId: string, sensorData: any) => {
  const thresholds = await storage.getThresholds(userId);
  
  const sensorTypes = ['ph', 'waterLevel', 'temperature', 'nh3', 'turbidity'];
  
  for (const sensorType of sensorTypes) {
    const value = sensorData[sensorType];
    if (value === null || value === undefined) continue;
    
    const threshold = thresholds.find(t => t.sensorType === sensorType && t.alertEnabled);
    if (!threshold) continue;
    
    let severity = 'normal';
    let message = '';
    let thresholdValue = null;
    
    if (threshold.minValue !== null && value < threshold.minValue) {
      severity = 'critical';
      message = `${sensorType} level (${value}) is below minimum threshold (${threshold.minValue})`;
      thresholdValue = threshold.minValue;
    } else if (threshold.maxValue !== null && value > threshold.maxValue) {
      severity = 'critical';
      message = `${sensorType} level (${value}) is above maximum threshold (${threshold.maxValue})`;
      thresholdValue = threshold.maxValue;
    }
    
    if (severity !== 'normal') {
      await storage.createAlert({
        userId,
        sensorType,
        message,
        severity,
        value,
        threshold: thresholdValue,
        acknowledged: false
      });
    }
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, name: user.name },
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      const user = await storage.verifyUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, name: user.name },
        token 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sensor data routes
  app.post("/api/sensor-data", authenticateToken, async (req, res) => {
    try {
      const sensorData = insertSensorDataSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      const reading = await storage.createSensorReading(sensorData);
      
      // Check thresholds and create alerts if necessary
      await checkThresholds(req.user.userId, sensorData);
      
      res.json(reading);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sensor-data", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const readings = await storage.getSensorReadings(req.user.userId, limit);
      res.json(readings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sensor-data/range", authenticateToken, async (req, res) => {
    try {
      const { startTime, endTime } = req.query;
      
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time required" });
      }
      
      const readings = await storage.getSensorReadingsByTimeRange(
        req.user.userId,
        new Date(startTime as string),
        new Date(endTime as string)
      );
      res.json(readings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Threshold routes
  app.post("/api/thresholds", authenticateToken, async (req, res) => {
    try {
      const thresholdData = insertThresholdSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      const threshold = await storage.createThreshold(thresholdData);
      res.json(threshold);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/thresholds", authenticateToken, async (req, res) => {
    try {
      const thresholds = await storage.getThresholds(req.user.userId);
      res.json(thresholds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/thresholds/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const threshold = await storage.updateThreshold(id, updateData);
      if (!threshold) {
        return res.status(404).json({ message: "Threshold not found" });
      }
      
      res.json(threshold);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/thresholds/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteThreshold(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Threshold not found" });
      }
      
      res.json({ message: "Threshold deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alert routes
  app.get("/api/alerts", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const alerts = await storage.getAlerts(req.user.userId, limit);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/alerts/unacknowledged", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getUnacknowledgedAlerts(req.user.userId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/alerts/:id/acknowledge", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const acknowledged = await storage.acknowledgeAlert(id);
      
      if (!acknowledged) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json({ message: "Alert acknowledged successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add dummy data endpoint for testing
  app.post("/api/sensor-data/dummy", authenticateToken, async (req, res) => {
    try {
      const dummyData = {
        userId: req.user.userId,
        ph: Math.random() * 2 + 6.5, // 6.5-8.5
        waterLevel: Math.random() * 30 + 60, // 60-90 cm
        temperature: Math.random() * 8 + 20, // 20-28°C
        nh3: Math.random() * 3, // 0-3 ppm
        turbidity: Math.random() * 25 + 5, // 5-30 NTU
      };
      
      const reading = await storage.createSensorReading(dummyData);
      await checkThresholds(req.user.userId, dummyData);
      
      res.json(reading);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
