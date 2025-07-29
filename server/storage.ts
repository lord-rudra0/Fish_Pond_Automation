import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { 
  users, 
  sensorData, 
  thresholds, 
  alerts,
  type User, 
  type InsertUser, 
  type SensorData, 
  type InsertSensorData,
  type Threshold,
  type InsertThreshold,
  type Alert,
  type InsertAlert
} from "@shared/schema";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:AMANrana@123@db.hpsdcybzciabshnndwxl.supabase.co:5432/postgres";

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(email: string, password: string): Promise<User | null>;
  
  // Sensor data
  createSensorReading(data: InsertSensorData): Promise<SensorData>;
  getSensorReadings(userId: string, limit?: number): Promise<SensorData[]>;
  getSensorReadingsByTimeRange(userId: string, startTime: Date, endTime: Date): Promise<SensorData[]>;
  
  // Thresholds
  createThreshold(threshold: InsertThreshold): Promise<Threshold>;
  getThresholds(userId: string): Promise<Threshold[]>;
  updateThreshold(id: number, threshold: Partial<InsertThreshold>): Promise<Threshold | undefined>;
  deleteThreshold(id: number): Promise<boolean>;
  
  // Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(userId: string, limit?: number): Promise<Alert[]>;
  acknowledgeAlert(id: number): Promise<boolean>;
  getUnacknowledgedAlerts(userId: string): Promise<Alert[]>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Sensor data
  async createSensorReading(data: InsertSensorData): Promise<SensorData> {
    const result = await db.insert(sensorData).values(data).returning();
    return result[0];
  }

  async getSensorReadings(userId: string, limit: number = 50): Promise<SensorData[]> {
    return await db.select()
      .from(sensorData)
      .where(eq(sensorData.userId, userId))
      .orderBy(desc(sensorData.timestamp))
      .limit(limit);
  }

  async getSensorReadingsByTimeRange(userId: string, startTime: Date, endTime: Date): Promise<SensorData[]> {
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
  async createThreshold(threshold: InsertThreshold): Promise<Threshold> {
    const result = await db.insert(thresholds).values(threshold).returning();
    return result[0];
  }

  async getThresholds(userId: string): Promise<Threshold[]> {
    return await db.select()
      .from(thresholds)
      .where(eq(thresholds.userId, userId));
  }

  async updateThreshold(id: number, threshold: Partial<InsertThreshold>): Promise<Threshold | undefined> {
    const result = await db.update(thresholds)
      .set(threshold)
      .where(eq(thresholds.id, id))
      .returning();
    return result[0];
  }

  async deleteThreshold(id: number): Promise<boolean> {
    const result = await db.delete(thresholds)
      .where(eq(thresholds.id, id));
    return result.rowCount > 0;
  }

  // Alerts
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const result = await db.insert(alerts).values(alert).returning();
    return result[0];
  }

  async getAlerts(userId: string, limit: number = 50): Promise<Alert[]> {
    return await db.select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.timestamp))
      .limit(limit);
  }

  async acknowledgeAlert(id: number): Promise<boolean> {
    const result = await db.update(alerts)
      .set({ acknowledged: true })
      .where(eq(alerts.id, id));
    return result.rowCount > 0;
  }

  async getUnacknowledgedAlerts(userId: string): Promise<Alert[]> {
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

export const storage = new DatabaseStorage();
