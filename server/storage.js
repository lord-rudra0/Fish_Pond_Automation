import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User, SensorData, Threshold, Alert } from "../shared/schema.js";

const DATABASE_URL = "mongodb+srv://rudrapratapsingh2026:tl78f8ICyVK4e5O8@cluster0.nledaqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log("🔗 Connecting to MongoDB...");
console.log("📡 Database URL:", DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide credentials

// Connect to MongoDB
mongoose.connect(DATABASE_URL);

class DatabaseStorage {
  // User management
  async getUser(id) {
    return await User.findById(id);
  }

  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user = new User({
      ...insertUser,
      password: hashedPassword,
    });
    return await user.save();
  }

  async verifyUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Sensor data
  async createSensorReading(data) {
    const reading = new SensorData(data);
    return await reading.save();
  }

  async getSensorReadings(userId, limit = 50) {
    return await SensorData.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getSensorReadingsByTimeRange(userId, startTime, endTime) {
    return await SensorData.find({
      userId,
      timestamp: { $gte: startTime, $lte: endTime }
    }).sort({ timestamp: -1 });
  }

  // Thresholds
  async createThreshold(threshold) {
    const newThreshold = new Threshold(threshold);
    return await newThreshold.save();
  }

  async getThresholds(userId) {
    return await Threshold.find({ userId });
  }

  async updateThreshold(id, threshold) {
    return await Threshold.findByIdAndUpdate(id, threshold, { new: true });
  }

  async deleteThreshold(id) {
    const result = await Threshold.findByIdAndDelete(id);
    return result !== null;
  }

  // Alerts
  async createAlert(alert) {
    const newAlert = new Alert(alert);
    return await newAlert.save();
  }

  async getAlerts(userId, limit = 50) {
    return await Alert.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async acknowledgeAlert(id) {
    const result = await Alert.findByIdAndUpdate(id, { acknowledged: true });
    return result !== null;
  }

  async getUnacknowledgedAlerts(userId) {
    return await Alert.find({
      userId,
      acknowledged: false
    }).sort({ timestamp: -1 });
  }
}

const storage = new DatabaseStorage();

export { storage };