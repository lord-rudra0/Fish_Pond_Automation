import { createServer } from "http";
import { storage } from "./storage.js";
import jwt from "jsonwebtoken";
import fetch from 'node-fetch';

const JWT_SECRET = "your-secret-key-here-change-this-in-production";

// Schema validation for sensor data
const insertSensorDataSchema = {
  parse: (data) => {
    const { userId, ph, waterLevel, temperature, nh3, turbidity } = data;
    if (!userId) throw new Error('userId is required');
    return {
      userId,
      ph: ph !== undefined ? parseFloat(ph) : null,
      waterLevel: waterLevel !== undefined ? parseFloat(waterLevel) : null,
      temperature: temperature !== undefined ? parseFloat(temperature) : null,
      nh3: nh3 !== undefined ? parseFloat(nh3) : null,
      turbidity: turbidity !== undefined ? parseFloat(turbidity) : null
    };
  }
};

// Schema validation for threshold data
const insertThresholdSchema = {
  parse: (data) => {
    const { userId, sensorType, minValue, maxValue, alertEnabled } = data;
    if (!userId) throw new Error('userId is required');
    if (!sensorType) throw new Error('sensorType is required');
    return {
      userId,
      sensorType,
      minValue: minValue !== undefined ? parseFloat(minValue) : null,
      maxValue: maxValue !== undefined ? parseFloat(maxValue) : null,
      alertEnabled: alertEnabled !== undefined ? Boolean(alertEnabled) : true
    };
  }
};

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

  // Simple test route to insert one sensor reading
  app.post("/api/test-single-reading", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log('Creating test reading for user:', userId);
      
      const sensorData = {
        userId,
        ph: 7.2,
        waterLevel: 85.5,
        temperature: 26.3,
        nh3: 0.25,
        turbidity: 8.7,
        timestamp: new Date()
      };
      
      console.log('Sensor data to insert:', sensorData);
      const reading = await storage.createSensorReading(sensorData);
      console.log('Inserted reading:', reading);
      
      // Verify it was inserted by querying back
      const allReadings = await storage.getSensorReadings(userId, 10);
      console.log('All readings for user:', allReadings);
      
      res.json({ 
        message: 'Test reading created successfully',
        reading,
        totalReadings: allReadings.length,
        allReadings
      });
    } catch (error) {
      console.error('Test reading error:', error);
      res.status(500).json({ message: error.message, stack: error.stack });
    }
  });

  // Test route to generate sample sensor data for the last 24 hours
  app.post("/api/generate-test-data", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log('Generating test data for user:', userId);
      const now = new Date();
      const readings = [];
      
      // Generate 24 data points (one per hour for the last 24 hours)
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // i hours ago
        
        // Generate realistic sensor values with some variation
        const baseValues = {
          ph: 7.0 + (Math.random() - 0.5) * 2, // pH between 6-8
          waterLevel: 80 + (Math.random() - 0.5) * 20, // Water level between 70-90%
          temperature: 25 + (Math.random() - 0.5) * 10, // Temperature between 20-30°C
          nh3: 0.1 + Math.random() * 0.4, // NH3 between 0.1-0.5 ppm
          turbidity: 5 + Math.random() * 10 // Turbidity between 5-15 NTU
        };
        
        const sensorData = {
          userId,
          ph: parseFloat(baseValues.ph.toFixed(2)),
          waterLevel: parseFloat(baseValues.waterLevel.toFixed(1)),
          temperature: parseFloat(baseValues.temperature.toFixed(1)),
          nh3: parseFloat(baseValues.nh3.toFixed(3)),
          turbidity: parseFloat(baseValues.turbidity.toFixed(1)),
          timestamp
        };
        
        console.log(`Creating reading ${i + 1}/24:`, sensorData);
        const reading = await storage.createSensorReading(sensorData);
        readings.push(reading);
      }
      
      console.log(`Successfully generated ${readings.length} readings`);
      
      // Verify data was inserted
      const allReadings = await storage.getSensorReadings(userId, 50);
      console.log(`Total readings in database for user: ${allReadings.length}`);
      
      res.json({ 
        message: `Generated ${readings.length} test sensor readings for the last 24 hours`,
        count: readings.length,
        totalInDatabase: allReadings.length,
        firstReading: readings[0],
        lastReading: readings[readings.length - 1]
      });
    } catch (error) {
      console.error('Test data generation error:', error);
      res.status(500).json({ message: error.message, stack: error.stack });
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
      const id = req.params.id;
      const deleted = await storage.deleteThreshold(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Threshold not found" });
      }
      
      res.json({ message: "Threshold deleted successfully" });
    } catch (error) {
      console.error('Error deleting threshold:', error);
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

  // Add test data endpoint without authentication for demo purposes
  app.post("/api/sensor-data/test", async (req, res) => {
    try {
      const dummyData = {
        userId: "test-user",
        ph: Math.random() * 2 + 6.5, // 6.5-8.5
        waterLevel: Math.random() * 30 + 60, // 60-90 cm
        temperature: Math.random() * 8 + 20, // 20-28°C
        nh3: Math.random() * 3, // 0-3 ppm
        turbidity: Math.random() * 25 + 5, // 5-30 NTU
      };
      
      const reading = await storage.createSensorReading(dummyData);
      
      res.json(reading);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get sensor data without authentication for demo purposes
  app.get("/api/sensor-data/demo", async (req, res) => {
    try {
      const { startTime, endTime } = req.query;
      
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time required" });
      }
      
      const readings = await storage.getSensorReadingsByTimeRange(
        "test-user",
        new Date(startTime),
        new Date(endTime)
      );
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/weather', async (req, res) => {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY || '840ac2f9e3319a7c7b9ccac65a713a0a';
      console.log('OpenWeather API Key:', apiKey ? 'Present' : 'Missing');
      
      if (!apiKey) {
        return res.status(500).json({ message: 'OpenWeather API key not configured' });
      }
      
      let url = '';
      if (req.query.city) {
        url = `https://pro.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(req.query.city)}&APPID=${apiKey}&units=metric`;
      } else if (req.query.lat && req.query.lon) {
        url = `https://pro.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&APPID=${apiKey}&units=metric`;
      } else {
        // Default: Delhi, India
        url = `https://pro.openweathermap.org/data/2.5/weather?q=Delhi&APPID=${apiKey}&units=metric`;
      }
      
      console.log('OpenWeather API URL:', url);
      const response = await fetch(url);
      console.log('OpenWeather API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('OpenWeather API Error Response:', errorText);
        throw new Error(`OpenWeather API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('OpenWeather API Success:', data.name, data.main?.temp);
      
      // Transform OpenWeather data to match the expected format
      const transformedData = {
        location: {
          name: data.name,
          country: data.sys?.country,
          lat: data.coord?.lat,
          lon: data.coord?.lon
        },
        current: {
          temp_c: data.main?.temp,
          temp_f: (data.main?.temp * 9/5) + 32,
          condition: {
            text: data.weather?.[0]?.description || 'Unknown',
            icon: `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon}@2x.png`
          },
          humidity: data.main?.humidity,
          pressure: data.main?.pressure,
          wind_speed: data.wind?.speed,
          wind_deg: data.wind?.deg
        }
      };
      
      res.json(transformedData);
    } catch (error) {
      console.error('OpenWeather API Error:', error.message);
      res.status(500).json({ message: 'Failed to fetch weather', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export { registerRoutes };