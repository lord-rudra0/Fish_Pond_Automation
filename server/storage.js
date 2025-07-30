import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const MONGODB_URI = "mongodb+srv://rudra:AMANrana123@rudra-fish-pond.b8mkjmx.mongodb.net/?retryWrites=true&w=majority&appName=Rudra-Fish-Pond";

let client;
let db;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db("fish-pond-monitoring");
  }
  return db;
}

class DatabaseStorage {
  // User management
  async getUser(id) {
    const database = await connectToDatabase();
    return await database.collection("users").findOne({ _id: new ObjectId(id) });
  }

  async getUserByEmail(email) {
    const database = await connectToDatabase();
    return await database.collection("users").findOne({ email });
  }

  async createUser(insertUser) {
    const database = await connectToDatabase();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user = {
      ...insertUser,
      password: hashedPassword,
      createdAt: new Date()
    };
    const result = await database.collection("users").insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async verifyUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getUserById(userId) {
    const database = await connectToDatabase();
    return await database.collection("users").findOne({ _id: new ObjectId(userId) });
  }

  async updateUser(userId, updateData) {
    const database = await connectToDatabase();
    const result = await database.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    return await this.getUserById(userId);
  }

  async updateUserPassword(userId, newPassword) {
    const database = await connectToDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await database.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    return await this.getUserById(userId);
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Sensor data
  async createSensorReading(data) {
    const database = await connectToDatabase();
    const sensorData = {
      ...data,
      timestamp: new Date()
    };
    const result = await database.collection("sensorData").insertOne(sensorData);
    return { ...sensorData, _id: result.insertedId };
  }

  async getSensorReadings(userId, limit = 50) {
    const database = await connectToDatabase();
    return await database.collection("sensorData")
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async getSensorReadingsByTimeRange(userId, startTime, endTime) {
    const database = await connectToDatabase();
    return await database.collection("sensorData")
      .find({
        userId,
        timestamp: {
          $gte: new Date(startTime),
          $lte: new Date(endTime)
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
  }

  // Thresholds
  async createThreshold(threshold) {
    const database = await connectToDatabase();
    const thresholdData = {
      ...threshold,
      createdAt: new Date()
    };
    const result = await database.collection("thresholds").insertOne(thresholdData);
    return { ...thresholdData, _id: result.insertedId };
  }

  async getThresholds(userId) {
    const database = await connectToDatabase();
    return await database.collection("thresholds")
      .find({ userId })
      .toArray();
  }

  async updateThreshold(id, threshold) {
    const database = await connectToDatabase();
    const result = await database.collection("thresholds")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: threshold },
        { returnDocument: 'after' }
      );
    return result.value;
  }

  async deleteThreshold(id) {
    const database = await connectToDatabase();
    const result = await database.collection("thresholds")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Alerts
  async createAlert(alert) {
    const database = await connectToDatabase();
    const alertData = {
      ...alert,
      timestamp: new Date()
    };
    const result = await database.collection("alerts").insertOne(alertData);
    return { ...alertData, _id: result.insertedId };
  }

  async getAlerts(userId, limit = 50) {
    const database = await connectToDatabase();
    return await database.collection("alerts")
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async acknowledgeAlert(id) {
    const database = await connectToDatabase();
    const result = await database.collection("alerts")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { acknowledged: true } }
      );
    return result.modifiedCount > 0;
  }

  async getUnacknowledgedAlerts(userId) {
    const database = await connectToDatabase();
    return await database.collection("alerts")
      .find({
        userId,
        acknowledged: false
      })
      .sort({ timestamp: -1 })
      .toArray();
  }
}

const storage = new DatabaseStorage();

export { storage };