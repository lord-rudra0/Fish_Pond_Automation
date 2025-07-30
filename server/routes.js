import { createServer } from "http";
import { storage } from "./storage.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your-secret-key-here-change-this-in-production";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Header:', authHeader);
  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT Verification Error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('Authenticated User:', user);
    req.user = user;
    next();
  });
};

// Helper function to check thresholds and create alerts
const checkThresholds = async (userId, sensorData) => {
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

async function registerRoutes(app) {
  // Test database connection
  app.get("/api/test-db", async (req, res) => {
    try {
      // Simple test query
      const result = await storage.getUserByEmail("test@example.com");
      res.json({ message: "Database connection successful", result });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ 
        message: "Database connection failed", 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  // Test sensor data without authentication
  app.get("/api/test-sensor-data", async (req, res) => {
    try {
      const readings = await storage.getSensorReadings("test-user", 10);
      res.json({ message: "Sensor data test successful", readings });
    } catch (error) {
      console.error("Sensor data test error:", error);
      res.status(500).json({ 
        message: "Sensor data test failed", 
        error: error.message 
      });
    }
  });

  // Authentication routes
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Basic validation
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser({ email, password, name });
      const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user._id.toString(), email: user.email, name: user.name },
        token 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        message: "Error connecting to database: " + error.message,
        details: error.stack 
      });
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
      
      const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user._id.toString(), email: user.email, name: user.name },
        token 
      });
    } catch (error) {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sensor-data", authenticateToken, async (req, res) => {
    try {
      console.log('User object:', req.user);
      console.log('User ID:', req.user?.userId);
      
      const limit = parseInt(req.query.limit) || 50;
      const readings = await storage.getSensorReadings(req.user.userId, limit);
      res.json(readings);
    } catch (error) {
      console.error('Sensor data error:', error);
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
        new Date(startTime),
        new Date(endTime)
      );
      res.json(readings);
    } catch (error) {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/thresholds", authenticateToken, async (req, res) => {
    try {
      const thresholds = await storage.getThresholds(req.user.userId);
      res.json(thresholds);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alert routes
  app.get("/api/alerts", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const alerts = await storage.getAlerts(req.user.userId, limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/alerts/unacknowledged", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getUnacknowledgedAlerts(req.user.userId);
      res.json(alerts);
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // User profile and password change routes
  app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }
      
      const updatedUser = await storage.updateUser(req.user.userId, { name, email });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/password", authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      // Verify current password
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isCurrentPasswordValid = await storage.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Update password
      const updatedUser = await storage.updateUserPassword(req.user.userId, newPassword);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export { registerRoutes };