import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { 
  users, 
  sensorData, 
  thresholds, 
  alerts
} from "../shared/schema.js";
import bcrypt from "bcrypt";

const DATABASE_URL = "postgresql://postgres.lluxruhejobeoydajjwg:AMANrana7392924934@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

class DatabaseStorage {
  // User management
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async verifyUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Sensor data
  async createSensorReading(data) {
    const result = await db.insert(sensorData).values(data).returning();
    return result[0];
  }

  async getSensorReadings(userId, limit = 50) {
    return await db.select()
      .from(sensorData)
      .where(eq(sensorData.userId, userId))
      .orderBy(desc(sensorData.timestamp))
      .limit(limit);
  }

  async getSensorReadingsByTimeRange(userId, startTime, endTime) {
    return await db.select()
      .from(sensorData)
      .where(
        and(
          eq(sensorData.userId, userId),
          gte(sensorData.timestamp, startTime),
          lte(sensorData.timestamp, endTime)
        )
      )
      .orderBy(desc(sensorData.timestamp));
  }

  // Thresholds
  async createThreshold(threshold) {
    const result = await db.insert(thresholds).values(threshold).returning();
    return result[0];
  }

  async getThresholds(userId) {
    return await db.select()
      .from(thresholds)
      .where(eq(thresholds.userId, userId));
  }

  async updateThreshold(id, threshold) {
    const result = await db.update(thresholds)
      .set(threshold)
      .where(eq(thresholds.id, id))
      .returning();
    return result[0];
  }

  async deleteThreshold(id) {
    const result = await db.delete(thresholds)
      .where(eq(thresholds.id, id));
    return result.rowCount > 0;
  }

  // Alerts
  async createAlert(alert) {
    const result = await db.insert(alerts).values(alert).returning();
    return result[0];
  }

  async getAlerts(userId, limit = 50) {
    return await db.select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.timestamp))
      .limit(limit);
  }

  async acknowledgeAlert(id) {
    const result = await db.update(alerts)
      .set({ acknowledged: true })
      .where(eq(alerts.id, id));
    return result.rowCount > 0;
  }

  async getUnacknowledgedAlerts(userId) {
    return await db.select()
      .from(alerts)
      .where(
        and(
          eq(alerts.userId, userId),
          eq(alerts.acknowledged, false)
        )
      )
      .orderBy(desc(alerts.timestamp));
  }
}

const storage = new DatabaseStorage();

export { storage };