import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
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
import path from "path";

// Create SQLite database file in the project root
const dbPath = path.join(process.cwd(), "fish-pond.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

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

export class SQLiteStorage implements IStorage {
  constructor() {
    this.initializeTables();
  }

  private initializeTables() {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        ph REAL,
        water_level REAL,
        temperature REAL,
        nh3 REAL,
        turbidity REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS thresholds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        sensor_type TEXT NOT NULL,
        min_value REAL,
        max_value REAL,
        alert_enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        sensor_type TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        value REAL,
        threshold REAL,
        acknowledged BOOLEAN DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

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
    return result.changes > 0;
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
    return result.changes > 0;
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

export const storage = new SQLiteStorage(); 